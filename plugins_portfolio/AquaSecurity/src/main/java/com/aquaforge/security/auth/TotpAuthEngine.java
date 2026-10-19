package com.aquaforge.security.auth;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;

/**
 * Standard RFC 6238 TOTP (Time-Based One-Time Password) Engine.
 * Fully compatible with Google Authenticator, Authy, and Microsoft Authenticator.
 *
 * Authored by Turgut Efekan Koç (efekkoc)
 * https://github.com/efekkoc
 */
public class TotpAuthEngine {

    private static final String BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final int SECRET_BYTES_COUNT = 10; // 80-bit key -> 16 Base32 characters
    private static final int TIME_STEP_SECONDS = 30;
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Generates a random Base32 encoded secret key.
     */
    public static String generateSecretKey() {
        byte[] bytes = new byte[SECRET_BYTES_COUNT];
        RANDOM.nextBytes(bytes);
        return encodeBase32(bytes);
    }

    /**
     * Verifies the given 6-digit code against the Base32 secret key.
     * Allows a +/- 1 window (past 30s and next 30s) to handle slight client clock drift.
     */
    public static boolean verifyCode(String secretKey, int code) {
        if (secretKey == null || secretKey.trim().isEmpty()) {
            return false;
        }

        long currentInterval = System.currentTimeMillis() / 1000L / TIME_STEP_SECONDS;
        byte[] decodedKey = decodeBase32(secretKey.toUpperCase().replace(" ", ""));

        // Check window: -1, 0, +1
        for (int i = -1; i <= 1; i++) {
            long hash = generateTotp(decodedKey, currentInterval + i);
            if (hash == code) {
                return true;
            }
        }
        return false;
    }

    private static int generateTotp(byte[] key, long timeInterval) {
        try {
            byte[] data = ByteBuffer.allocate(8).putLong(timeInterval).array();
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "RAW"));
            byte[] hash = mac.doFinal(data);

            // Dynamic truncation (RFC 4226)
            int offset = hash[hash.length - 1] & 0xF;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);

            return binary % 1_000_000;
        } catch (GeneralSecurityException e) {
            return -1;
        }
    }

    private static String encodeBase32(byte[] data) {
        StringBuilder result = new StringBuilder();
        int buffer = 0;
        int bitsLeft = 0;

        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xFF);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                bitsLeft -= 5;
                result.append(BASE32_CHARS.charAt((buffer >> bitsLeft) & 0x1F));
            }
        }
        if (bitsLeft > 0) {
            result.append(BASE32_CHARS.charAt((buffer << (5 - bitsLeft)) & 0x1F));
        }
        return result.toString();
    }

    private static byte[] decodeBase32(String base32) {
        int buffer = 0;
        int bitsLeft = 0;
        byte[] out = new byte[base32.length() * 5 / 8];
        int count = 0;

        for (int i = 0; i < base32.length(); i++) {
            char c = base32.charAt(i);
            int val = BASE32_CHARS.indexOf(c);
            if (val < 0) continue;

            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                bitsLeft -= 8;
                if (count < out.length) {
                    out[count++] = (byte) ((buffer >> bitsLeft) & 0xFF);
                }
            }
        }
        return out;
    }

    /**
     * Builds otpauth URI for QR code generation.
     */
    public static String getOtpAuthUrl(String issuer, String accountName, String secretKey) {
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s",
                issuer, accountName, secretKey, issuer);
    }
}
