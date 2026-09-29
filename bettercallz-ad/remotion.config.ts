import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
// Parallel Chromium workers occasionally return a tiled frame; serial is safe.
Config.setConcurrency(1);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setCrf(16);
