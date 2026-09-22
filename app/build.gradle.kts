plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.google.services)
}


android {
    namespace = "io.github.giwih.heatmap"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.panatara.household"
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
            resValue("string", "app_name", "(Debug) Household")
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

configurations.all {
    resolutionStrategy {
        force("org.jetbrains.kotlin:kotlin-stdlib:1.8.22")
        force("org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.22")
        force("org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.22")
        force("org.jetbrains.kotlin:kotlin-stdlib-common:1.8.22")
    }
}

dependencies {
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.core:core-ktx:1.15.0")
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.messaging)
}