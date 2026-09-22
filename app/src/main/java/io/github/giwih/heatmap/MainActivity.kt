package io.github.giwih.heatmap

import android.Manifest
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.HapticFeedbackConstants
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.google.firebase.messaging.FirebaseMessaging

class MainActivity : ComponentActivity() {
    private lateinit var myWebView: WebView

    // Навигационное состояние веб-интерфейса
    private var isModalOpen: Boolean = false
    private var activeTab: String = "statsScreen"
    private var canGoBack: Boolean = false

    companion object {
        private const val TAG = "MainActivity"
        private const val OPEN_IMAGE_REQUEST = 2
        private const val MAIN_TAB = "statsScreen"
        private var activeInstance: MainActivity? = null

        fun sendTokenToWeb(token: String) {
            activeInstance?.runOnUiThread {
                activeInstance?.myWebView?.evaluateJavascript(
                    "window.onNativeFcmToken && window.onNativeFcmToken('$token')",
                    null
                )
            }
        }
    }

    private val requestNotificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            Log.d(TAG, "POST_NOTIFICATIONS permission granted")
        } else {
            Log.w(TAG, "POST_NOTIFICATIONS permission denied")
        }
    }

    /**
     * Обратный вызов OnBackPressedCallback из AndroidX.
     */
    private val backPressedCallback = object : OnBackPressedCallback(false) {
        override fun handleOnBackPressed() {
            triggerWebBackAction()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        activeInstance = this

        // Регистрация колбэка
        onBackPressedDispatcher.addCallback(this, backPressedCallback)
        updateBackCallbackState()

        // Запрос разрешения на уведомления для Android 13+
        askNotificationPermission()

        myWebView = WebView(this)
        myWebView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            allowUniversalAccessFromFileURLs = true
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        myWebView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Отправляем токен в веб сразу после загрузки страницы
                val savedToken = MyFirebaseMessagingService.getSavedToken(this@MainActivity)
                if (!savedToken.isNullOrEmpty()) {
                    sendTokenToWeb(savedToken)
                }
            }
        }
        myWebView.addJavascriptInterface(WebAppInterface(), "AndroidBridge")

        setContentView(myWebView)
        myWebView.loadUrl("file:///android_asset/index.html")

        // Запрашиваем актуальный FCM токен у Firebase
        fetchFcmToken()
    }

    private fun askNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED
            ) {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    private fun fetchFcmToken() {
        try {
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val token = task.result
                    Log.d(TAG, "FCM token fetched: $token")
                    MyFirebaseMessagingService.saveToken(this, token)
                    sendTokenToWeb(token)
                } else {
                    Log.w(TAG, "Fetching FCM registration token failed", task.exception)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing FirebaseMessaging token retrieval: ${e.message}")
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (activeInstance == this) {
            activeInstance = null
        }
    }

    /**
     * Проверка, является ли текущая вкладка главной.
     */
    private fun isMainTab(tab: String): Boolean {
        return tab == MAIN_TAB
    }

    /**
     * Динамическое переключение флага isEnabled:
     */
    private fun updateBackCallbackState() {
        val shouldIntercept = isModalOpen || canGoBack || !isMainTab(activeTab)
        backPressedCallback.isEnabled = shouldIntercept
    }

    /**
     * Отправка действия "Назад" обратно в веб-приложение через JavaScript интерфейс.
     */
    private fun triggerWebBackAction() {
        myWebView.evaluateJavascript(
            "window.onNativeBack && window.onNativeBack()",
            null
        )
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == OPEN_IMAGE_REQUEST && resultCode == RESULT_OK) {
            val uri = data?.data ?: return

            val bytes = contentResolver.openInputStream(uri)?.readBytes() ?: return
            val mimeType = contentResolver.getType(uri) ?: "image/jpeg"
            val base64 = android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP)
            val dataUrl = "data:$mimeType;base64,$base64"

            myWebView.post {
                myWebView.evaluateJavascript("window.onImagePicked('$dataUrl')", null)
            }
        }
    }

    inner class WebAppInterface {

        @JavascriptInterface
        fun getFcmToken(): String {
            return MyFirebaseMessagingService.getSavedToken(this@MainActivity) ?: ""
        }

        @JavascriptInterface
        fun updateNavigationState(isModalOpen: Boolean, activeTab: String, canGoBack: Boolean) {
            runOnUiThread {
                this@MainActivity.isModalOpen = isModalOpen
                this@MainActivity.activeTab = activeTab
                this@MainActivity.canGoBack = canGoBack
                updateBackCallbackState()
            }
        }

        @JavascriptInterface
        fun updateNavigationState(isModalOpen: Boolean, activeTab: String) {
            updateNavigationState(isModalOpen, activeTab, isModalOpen || !isMainTab(activeTab))
        }

        @JavascriptInterface
        fun setModalState(isOpen: Boolean) {
            runOnUiThread {
                this@MainActivity.isModalOpen = isOpen
                updateBackCallbackState()
            }
        }

        @JavascriptInterface
        fun setActiveTab(tab: String) {
            runOnUiThread {
                this@MainActivity.activeTab = tab
                updateBackCallbackState()
            }
        }

        @JavascriptInterface
        fun showConfirmDialog(title: String, message: String) {
            runOnUiThread {
                AlertDialog.Builder(this@MainActivity)
                    .setTitle(title)
                    .setMessage(message)
                    .setPositiveButton("OK") { _, _ ->
                        myWebView.evaluateJavascript("window.onNativeResponse(true)", null)
                    }
                    .setNegativeButton("Отмена") { _, _ ->
                        myWebView.evaluateJavascript("window.onNativeResponse(false)", null)
                    }
                    .setCancelable(false)
                    .show()
            }
        }

        @JavascriptInterface
        fun haptic() {
            runOnUiThread {
                myWebView.performHapticFeedback(HapticFeedbackConstants.CONFIRM)
            }
        }

        @JavascriptInterface
        fun finish() {
            this@MainActivity.finish()
        }

        @JavascriptInterface
        fun openImagePicker() {
            runOnUiThread {
                val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "image/*"
                }
                @Suppress("DEPRECATION")
                startActivityForResult(intent, OPEN_IMAGE_REQUEST)
            }
        }
    }
}