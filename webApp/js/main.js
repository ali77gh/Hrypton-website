
(function ($) {
    "use strict";


    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function () {
        $(this).on('blur', function () {
            if ($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })
    })


    /*==================================================================
    [ Validate ]*/

    var validator = new class {

        minSize = 10
        allowedSpecialChars = "//~!@#$%^&*_-+=`|\\(){}[]:;\"'<>,.?/"
        OK = "OK"

        isUpperCase = (string) => /^[A-Z]*$/.test(string)
        isLowerCase = (string) => /^[a-z]*$/.test(string)

        password = function (password) {
            if (password == "") return "is empty"


            var haveDigit = false
            var haveUpper = false
            var haveLower = false
            var haveSpecialChar = false

            for (var i = 0; i < password.length; i++) {
                var char = password.charAt(i)
                if (char == ' ') return "space is not allowed"
                else if (!isNaN(char)) haveDigit = true
                else if (this.isUpperCase(char)) haveUpper = true
                else if (this.isLowerCase(char)) haveLower = true
                else if (this.allowedSpecialChars.indexOf(char) != -1) haveSpecialChar = true
                else return "char \"$i\" not allowed"
            };


            if (!haveDigit) return "should have numbers"
            if (!haveUpper) return "should have upper case letters"
            if (!haveLower) return "should have lower case letters"
            if (!haveSpecialChar) return "should have special chars"

            if (password.length < this.minSize) {
                return "should be more then 10 chars"
            }

            return this.OK
        }

        url = function (website) {
            if (website == "") return "is empty"

            if (website.indexOf('.') == -1)
                return "should have .com , .org ,..."

            if (website.indexOf(' ') != -1)
                return "space is not allowed"

            return this.OK
        }

        username = function (username) {

            // username is optional
            //if(username == "") return "is empty"


            if (username.indexOf(' ') != -1)
                return "space is not allowed"
            //todo

            return this.OK
        }
    }();

    var pasher = new class {

        //config
        HASH_LAYERS_COUNT = 50_000 // increase this make algorithm slower (and safer)
        PASSWORD_MIN_SIZE = 12 //if you want to increase PASSWORD_MIN_SIZE use sha-512
        ENABLE_CACHE = true

        cache = new Map()

        isUpperCase = (string) => /^[A-Z]*$/.test(string)
        isLowerCase = (string) => /^[a-z]*$/.test(string)
        isDigit = (string) => /^[0-9]*$/.test(string)

        /**
        * @return 64 chars (0 1 2 3 4 5 6 7 8 9 a b c d e f) with same possibility
        * test passed
        * */
        async sha256(message) {
            // encode as UTF-8
            const msgBuffer = new TextEncoder('utf-8').encode(message);

            // hash the message
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

            // convert ArrayBuffer to Array
            const hashArray = Array.from(new Uint8Array(hashBuffer));

            // convert bytes to hex string                  
            const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
            return hashHex;
        }

        /**
        *  calling hash many times to make reverse (crack) harder
        *  @return 64 lower case and numbers
        * */
        async slowIt(input) {

            for (var i = 0; i <= this.HASH_LAYERS_COUNT; i++) {
                input = await this.sha256(input)
            }
            return input
        }


        // standard

        hexChars = "0123456789abcdef"
        allowedChars = "0123456789abcdefghijkmnlopqrstuvwxyzABCDEFGHIJKMNLPOQRSTUVWXYZ/~!@#\$%^&*_-+=`|\\(){}[]:;\"'<>,.?"

        /**
        * char replacement map
        * @param input lower case and number (char)
        * @return      upper case and allowed special chars (char)
        * */
        switch(input1, input2) {

            var number = this.charsToNum(input1, input2)
            // num is a number 0 <= x <= 127
            // so make it a number 0 <= x <= allowedChars.size()
            number = number * (this.allowedChars.length - 1) / 127
            return this.allowedChars.charAt(number)

        }

        charToNum(char) { return this.hexChars.indexOf(char) }


        charsToNum(input1, input2) {

            switch (input1) {
                case '0': return this.hexChars.indexOf(input2);
                case '1': return this.hexChars.indexOf(input2);
                case '2': return this.hexChars.indexOf(input2) + 16;
                case '3': return this.hexChars.indexOf(input2) + 16;
                case '4': return this.hexChars.indexOf(input2) + 32;
                case '5': return this.hexChars.indexOf(input2) + 32;
                case '6': return this.hexChars.indexOf(input2) + 48;
                case '7': return this.hexChars.indexOf(input2) + 48;
                case '8': return this.hexChars.indexOf(input2) + 64;
                case '9': return this.hexChars.indexOf(input2) + 64;
                case 'a': return this.hexChars.indexOf(input2) + 80;
                case 'b': return this.hexChars.indexOf(input2) + 80;
                case 'c': return this.hexChars.indexOf(input2) + 96;
                case 'd': return this.hexChars.indexOf(input2) + 96;
                case 'e': return this.hexChars.indexOf(input2) + 112;
                case 'f': return this.hexChars.indexOf(input2) + 112;
                default : throw "not allowed input1: " + input1;
            }
        }

        /**
       * char replacement map
       * @param input string
       * @return      string
       * */
        async standard(input) {

            var result = ""
            for (var i = 0; i <= 63; i += 2) {
                result += this.switch(input.charAt(i), input.charAt(i + 1))
            }

            //if its not standard try one more hash
            //(to make sure output is standard password and website validator gonna accept it)
            if (validator.password(result.substring(0, this.PASSWORD_MIN_SIZE)) != validator.OK) {
                result = await this.sha256(result)
                result = await this.standard(result)
            }

            return result
        }

        /**
        * @param hashResult 64 lower case and numbers
        * @return 4 digits (in string)
        * */
        bankMode(hashResult) {

            var result = ""
            for (var i = 0; i <= 3; i++) {
                var num = this.charToNum(hashResult[i])
                // num is a number 0 <= x <= 15
                // so make it a number 0 <= x <= 9
                num = ((num / 15) * 9)
                result += num.toString()
            }
            return result
        }


        /**
        * @return chars with dynamic size (PASSWORD_MIN_SIZE..PASSWORD_MIN_SIZE+3) with same possibility
        * */
        limitIt(input) {

            var bit1 =
                this.isLowerCase(input.charAt(input.length - 1))
                ||
                this.isDigit(input.charAt(input.length - 1))

            var bit2 =
                this.isLowerCase(input.charAt(input.length - 2))
                ||
                this.isDigit(input.charAt(input.length - 2))


            if      (bit1 && bit2)   return input.substring(0, this.PASSWORD_MIN_SIZE);
            else if (!bit1 && bit2)  return input.substring(0, this.PASSWORD_MIN_SIZE + 1);
            else if (bit1 && !bit2)  return input.substring(0, this.PASSWORD_MIN_SIZE + 2);
            else if (!bit1 && !bit2) return input.substring(0, this.PASSWORD_MIN_SIZE + 3);
            
        }


        // public methods

        /**
         * hash to generate password
         * @param listener this callback called when password is ready (not in ui thread)
         * result is standard password with lower case and upper case numbers and special chars
         * with dynamic size
         * */
        async pash(masterPass, url, username, isGuest) {

            var value = masterPass + url + username

            if (isGuest) value += "whatever"

            if (this.cache.get(value) != undefined)
                return this.cache.get(value)
            

            var pash = await this.slowIt(value)
            pash = await this.standard(pash)
            pash = this.limitIt(pash)


            if (this.ENABLE_CACHE)
                this.cache.set(value, pash)// push to cache

            return pash
        }

    }();



    var input = $('.validate-input .input100');

    var masterPass;
    var url;
    var username;

    function validate() {

        var masterPassErr = validator.password(masterPass.value)
        var urlErr = validator.url(url.value)
        var usernameErr = validator.username(username.value)

        if (masterPassErr != validator.OK) {
            showError(masterPass.view, masterPassErr);
        }

        if (urlErr != validator.OK) {
            showError(url.view, urlErr);
        }

        if (usernameErr != validator.OK) {
            showError(username.view, usernameErr);
        }

        if (masterPassErr == validator.OK && urlErr == validator.OK && usernameErr == validator.OK)
            return true;
        else
            return false;
    }

    $('.login100-form-btn').on('click', function () {

        masterPass = {
            view: input[0],
            value: $(input[0]).val().trim()
        }

        url = {
            view: input[1],
            value: $(input[1]).val().trim()
        }

        username = {
            view: input[2],
            value: $(input[2]).val().trim()
        }

        if (validate()) {
            // todo is guest

            $('.login100-form-bgbtn').hide()
            $('.login100-form-btn').text("loading...");
            
            pasher.pash(masterPass.value, url.value, username.value, false).then((successMessage) => {

                $('.login100-form-bgbtn').show()
                $('.login100-form-btn').text("generate");
                $('.login100-output').html("your password:</br>" + successMessage)
            });

        }
    });



    function showError(input, msg) {
        var thisAlert = $(input).parent();


        $(thisAlert).addClass('alert-validate');

        $(thisAlert).attr("data-validate", msg);
    }


    /*==================================================================
    [ hide errors on focus ]*/
    $('.validate-form .input100').each(function () {
        $(this).focus(function () {
            hideValidate(this);
            $('.login100-output').text("");//clear on text focus
        });
    });
    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }

    /*==================================================================
    [ Show-hide pass ]*/
    var showPass = 0;
    $('.btn-show-pass').on('click', function () {
        if (showPass == 0) {
            $(this).next('input').attr('type', 'text');
            $(this).find('i').removeClass('zmdi-eye');
            $(this).find('i').addClass('zmdi-eye-off');
            showPass = 1;
        }
        else {
            $(this).next('input').attr('type', 'password');
            $(this).find('i').addClass('zmdi-eye');
            $(this).find('i').removeClass('zmdi-eye-off');
            showPass = 0;
        }

    });


})(jQuery);