//angular.module('app').service('encrypter', function () {
//    var key = forge.random.getBytesSync(16);
//    var iv = forge.random.getBytesSync(16);
//
//    var encrypt = new function (value) {
//        // encrypt some bytes using CBC mode
//        // (other modes include: ECB, CFB, OFB, CTR, and GCM)
//        // Note: CBC and ECB modes use PKCS#7 padding as default
//        var cipher = forge.cipher.createCipher('AES-CBC', key);
//        cipher.start({ iv: iv });
//        cipher.update(forge.util.createBuffer('123123'));
//        cipher.finish();
//        var encrypted = cipher.output;
//        // outputs encrypted hex
//        console.log(encrypted.toHex());
//    }
//
//    this.decrypt = new function (encrypted)
//    {
//        // decrypt some bytes using CBC mode
//        // (other modes include: CFB, OFB, CTR, and GCM)
//        var decipher = forge.cipher.createDecipher('AES-CBC', key);
//        decipher.start({ iv: iv });
//        decipher.update(encrypted);
//        decipher.finish();
//        // outputs decrypted hex
//        return decipher.output.data;
//    }
//});