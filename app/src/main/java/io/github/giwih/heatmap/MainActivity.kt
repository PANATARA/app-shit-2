package io.github.giwih.heatmap

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.view.HapticFeedbackConstants
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback

class MainActivity : ComponentActivity() {
    private lateinit var myWebView: WebView

    // Навигационное состояние веб-интерфейса
    private var isModalOpen: Boolean = false
    private var activeTab: String = "statsScreen"
    private var canGoBack: Boolean = false

    companion object {
        private const val OPEN_IMAGE_REQUEST = 2
        // Имя домашней / главной вкладки
        private const val MAIN_TAB = "statsScreen"
    }

    /**
     * Обратный вызов OnBackPressedCallback из AndroidX.
     * Активен (isEnabled = true) только когда есть что закрыть (модалка, подэкран или история).
     * Когда экранов для возврата нет (isEnabled = false), система выполняет
     * стандартное системное действие выхода / сворачивания (с поддержкой Predictive Back).
     */
    private val backPressedCallback = object : OnBackPressedCallback(false) {
        override fun handleOnBackPressed() {
            triggerWebBackAction()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Регистрация колбэка с автоматической привязкой к LifecycleOwner (ComponentActivity)
        // Исключает утечки памяти (Memory Leaks) при уничтожении активити
        onBackPressedDispatcher.addCallback(this, backPressedCallback)
        updateBackCallbackState()

        myWebView = WebView(this)
        myWebView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            allowUniversalAccessFromFileURLs = true
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        myWebView.webViewClient = WebViewClient()
        myWebView.addJavascriptInterface(WebAppInterface(), "AndroidBridge")

        setContentView(myWebView)
        myWebView.loadUrl("file:///android_asset/index.html")
    }

    /**
     * Проверка, является ли текущая вкладка главной.
     */
    private fun isMainTab(tab: String): Boolean {
        return tab == MAIN_TAB
    }

    /**
     * Динамическое переключение флага isEnabled:
     * Колбэк перехватывает жест только при открытой модалке, возможности вернуться назад или неосновной вкладке.
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

        /**
         * Метод синхронизации состояния открытых окон и текущей вкладки из веб-интерфейса.
         * @param isModalOpen флаг наличия хотя бы одного открытого модального окна
         * @param activeTab идентификатор активной вкладки
         */
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

        /**
         * Уведомление об изменении состояния модального окна.
         */
        @JavascriptInterface
        fun setModalState(isOpen: Boolean) {
            runOnUiThread {
                this@MainActivity.isModalOpen = isOpen
                updateBackCallbackState()
            }
        }

        /**
         * Уведомление об изменении активной вкладки.
         */
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