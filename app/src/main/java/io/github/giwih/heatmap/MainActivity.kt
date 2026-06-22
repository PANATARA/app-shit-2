package io.github.giwih.heatmap

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.HapticFeedbackConstants
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import org.json.JSONObject

class MainActivity : Activity() {
    private lateinit var myWebView: WebView
    private var pendingJson: String? = null

    companion object {
        private const val OPEN_IMAGE_REQUEST = 2
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        myWebView = WebView(this)
        myWebView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            allowUniversalAccessFromFileURLs = true
        }

        myWebView.webViewClient = WebViewClient()
        myWebView.addJavascriptInterface(WebAppInterface(), "AndroidBridge")

        setContentView(myWebView)
        // myWebView.loadUrl("file:///android_asset/index.html")
        myWebView.loadUrl("192.168.0.233:5173")
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

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        myWebView.evaluateJavascript("window.onAndroidBack && window.onAndroidBack()", null)
    }

    inner class WebAppInterface {

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