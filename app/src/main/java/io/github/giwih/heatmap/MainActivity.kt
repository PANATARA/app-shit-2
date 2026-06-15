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
        private const val CREATE_FILE_REQUEST = 1
        private const val OPEN_FILE_REQUEST = 2
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
        myWebView.loadUrl("file:///android_asset/index.html")
        // myWebView.loadUrl("192.168.0.233:5173")
        // myWebView.loadUrl("192.168.0.94:5173")
        // myWebView.loadUrl("92.100.39.109:5173"
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        // Экспорт — запись файла
        if (requestCode == CREATE_FILE_REQUEST && resultCode == RESULT_OK) {
            data?.data?.let { uri ->
                Thread {
                    contentResolver.openOutputStream(uri)?.use { stream ->
                        stream.write(pendingJson?.toByteArray() ?: return@Thread)
                    }
                    pendingJson = null
                    runOnUiThread {
                        myWebView.evaluateJavascript("window.onExportDone && window.onExportDone()", null)
                    }
                }.start()
            }
        }
        // Импорт — чтение файла
        if (requestCode == OPEN_FILE_REQUEST && resultCode == RESULT_OK) {
            data?.data?.let { uri ->
                Thread {
                    val json = contentResolver.openInputStream(uri)
                        ?.bufferedReader()
                        ?.readText()
                        ?: return@Thread

                    val escaped = json
                        .replace("\\", "\\\\")
                        .replace("'", "\\'")
                        .replace("\n", "\\n")
                        .replace("\r", "")

                    runOnUiThread {
                        myWebView.evaluateJavascript(
                            "window.onImportData && window.onImportData('$escaped')",
                            null
                        )
                    }
                }.start()
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
        fun saveJsonFilePicker(json: String, filename: String) {
            runOnUiThread {
                pendingJson = json
                val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "application/json"
                    putExtra(Intent.EXTRA_TITLE, filename)
                }
                @Suppress("DEPRECATION")
                startActivityForResult(intent, CREATE_FILE_REQUEST)
            }
        }

        // Открыть файловый менеджер для выбора JSON файла
        @JavascriptInterface
        fun openJsonFilePicker() {
            runOnUiThread {
                val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "application/json"
                }
                @Suppress("DEPRECATION")
                startActivityForResult(intent, OPEN_FILE_REQUEST)
            }
        }


        // Читаем цвет из ресурсов и возвращаем как #rrggbb
        private fun colorHex(resId: Int): String {
            val c = resources.getColor(resId, theme)
            return String.format("#%06X", 0xFFFFFF and c)
        }

        /**
         * Возвращает JSON с Material You цветами системы.
         * Доступно только на Android 12+ (API 31).
         * Если не поддерживается — возвращает null.
         *
         * Структура ответа:
         * {
         *   "supported": true,
         *   "dark": {
         *     "--accent": "#...",
         *     "--accent-container": "rgba(...)",
         *     ... (18 переменных)
         *   },
         *   "light": { ... }
         * }
         */
        @JavascriptInterface
        fun getMaterialYouColors(): String {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
                return JSONObject().apply { put("supported", false) }.toString()
            }

            fun rgba(hex: String, alpha: Double): String {
                val r = Integer.parseInt(hex.substring(1, 3), 16)
                val g = Integer.parseInt(hex.substring(3, 5), 16)
                val b = Integer.parseInt(hex.substring(5, 7), 16)
                return "rgba($r,$g,$b,$alpha)"
            }

            // --- Акценты ---
            // Для тёмной темы (светлые акценты на тёмном фоне)
            val a1_200 = colorHex(android.R.color.system_accent1_200) // Главный акцент тёмной
            val a2_200 = colorHex(android.R.color.system_accent2_200) 
            
            // Для светлой темы (насыщенные акценты)
            val a1_600 = colorHex(android.R.color.system_accent1_600) // Главный акцент светлой
            val a1_900 = colorHex(android.R.color.system_accent1_900)
            
            // Контейнеры (мягкие фоны для активных элементов)
            val a1_100 = colorHex(android.R.color.system_accent1_100)
            val a2_100 = colorHex(android.R.color.system_accent2_100)

            // --- Нейтральные (Фоны, карточки, текст) ---
            // 10-100: Светлые (Фоны светлой темы, текст тёмной)
            val n1_10  = colorHex(android.R.color.system_neutral1_10)  // Почти белый (фон)
            val n1_50  = colorHex(android.R.color.system_neutral1_50)  // Светлый (карточки)
            val n2_50  = colorHex(android.R.color.system_neutral2_50)  // Бар/Навигация светлой
            val n2_100 = colorHex(android.R.color.system_neutral2_100) 
            val n2_200 = colorHex(android.R.color.system_neutral2_200) // Мягкие бордеры светлой!

            // 400-500: Средние (Вторичный текст)
            val n2_400 = colorHex(android.R.color.system_neutral2_400)
            val n2_500 = colorHex(android.R.color.system_neutral2_500)

            // 700-900: Тёмные (Фоны тёмной темы, текст светлой)
            val n1_900 = colorHex(android.R.color.system_neutral1_900) // Тёмный фон
            val n2_700 = colorHex(android.R.color.system_neutral2_700) // Бордеры тёмной
            val n2_800 = colorHex(android.R.color.system_neutral2_800) // Карточки тёмной
            val n2_900 = colorHex(android.R.color.system_neutral2_900) // Навигация тёмной

            // ── Тёмная тема ──
            val darkVars = JSONObject().apply {
                put("--accent",            a1_200)
                put("--accent-container",  rgba(a1_200, 0.15))

                put("--bg",                n1_900)
                put("--bg-overlay",        n1_900)
                put("--bg-card",           n2_800) // neutral2 даёт более глубокий, приятный оттенок
                put("--bg-card-deep",      n2_800)
                put("--bg-bar",            n2_900)
                put("--bg-nav",            n2_900)
                put("--bg-icon",           rgba(a1_200, 0.10)) // Едва заметный цветной фон иконки
                put("--bg-input",          n2_700)
                put("--bg-counter",        n1_900)
                put("--bg-btn-minus",      n2_800)
                put("--bg-dropdown",       n2_800)

                put("--nav-active-bg",     rgba(a2_200, 0.20))
                put("--nav-active-fg",     a1_200)
                put("--heat-graph-bg",     n2_900)

                put("--border",            "#f000")
                put("--border-card",       n2_700)
                put("--border-counter",    n2_700)
                put("--border-input",      n2_700)
                put("--divider",           n2_700)

                // Текст, затонированный под цвет системы
                put("--text-primary",      n1_50)
                put("--text-secondary",    n2_400)
                put("--text-muted",        n2_500)
                put("--text-nav",          n2_400)
            }

            // ── Светлая тема ──
            val lightVars = JSONObject().apply {
                put("--accent",            a1_600)
                put("--accent-container",  a1_100) // Нативный непрозрачный M3 контейнер

                put("--bg",                n1_10) // Лёгкий оттенок обоев, не чисто белый
                put("--bg-overlay",        n1_10)
                put("--bg-card",           "#ffffff") // Карточки чисто белые для контраста
                put("--bg-card-deep",      n1_50)
                put("--bg-bar",            n2_50)
                put("--bg-nav",            "#ffffff")
                put("--bg-icon",           n2_100)
                put("--bg-input",          "#ffffff")
                put("--bg-counter",        n2_50)
                put("--bg-btn-minus",      n2_100)
                put("--bg-dropdown",       "#ffffff")

                put("--nav-active-bg",     a2_100) // Вторичный светлый акцент
                put("--nav-active-fg",     a1_900) // Тёмный акцент на светлом
                put("--heat-graph-bg",     n2_50)

                // Идеально мягкие бордеры для светлой темы
                put("--border",            n2_200) 
                put("--border-card",       n2_200)
                put("--border-counter",    n2_200)
                put("--border-input",      n2_200)
                put("--divider",           n2_200)

                // Текст, затонированный под цвет системы
                put("--text-primary",      n1_900)
                put("--text-secondary",    n2_700)
                put("--text-muted",        n2_500)
                put("--text-nav",          n2_700)
            }

            return JSONObject().apply {
                put("supported", true)
                put("dark", darkVars)
                put("light", lightVars)
            }.toString()
        }
    }
}