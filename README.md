# Castify CTVNative

### 1. Platform Configuration
CTVNative supports a variety of platforms such as Samsung, LG, Vidaa, Vizio, and Zeasn. Most of the UI and features are all the same. The main difference is only key event handling, as some key codes are different depending on the platform.
So We are managing them in `src/platforms/`.

### 2. Ads Configuration

https://developers.google.com/ad-manager/pal/ctv

### 3. Deploy
 - generate bundle with the latest codes by running `npm run build` or `yarn build`.
 - for the development deploy, after rename the bundle file's name to "bundle_dev.js", upload it to S3 castify bucket/smart_tv_v2
 - for the production deploy, upload it to S3 castify bucket/files/lg and files/samsung
   
