plugins {
    alias(libs.plugins.android.application)
}


android {
    namespace = "io.github.giwih.heatmap"
    compileSdk = 36

    defaultConfig {
        applicationId = "io.github.giwih.heatmap"
        minSdk = 21
        targetSdk = 36
        versionCode = 4
        versionName = "0.4"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    signingConfigs {
        create("release") {
            storeFile = file("$rootDir/keystore.jks")
            storePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD") ?: "123456"
            keyAlias = System.getenv("ANDROID_KEY_ALIAS") ?: "my-key"
            keyPassword = System.getenv("ANDROID_KEY_PASSWORD") ?: "123456"
        }
    }

    dependenciesInfo {
        includeInApk = false
        includeInBundle = false
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            resValue("string", "app_name", "(Debug) Heatmap")
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                // getDefaultProguardFile("proguard-android.txt"),
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
    }

    buildFeatures {
        resValues = true
    }
}