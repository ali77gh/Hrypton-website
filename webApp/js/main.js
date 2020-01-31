
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

    class Validation {

        minSize = 10
        allowedSpecialChars = "//~!@#\$%^&*_-+=`|\\(){}[]:;\"'<>,.?/"
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
    }

    var input = $('.validate-input .input100');

    var masterPass;
    var url;
    var username;
    
    var validator = new Validation();

    function validate() {
        
        var masterPassErr = validator.password(masterPass.value)
        var urlErr = validator.url(url.value)
        var usernameErr = validator.username(username.value)

        if(masterPassErr != validator.OK){
            showError(masterPass.view ,masterPassErr);
        }

        if(urlErr != validator.OK){
            showError(url.view ,urlErr);
        }

        if(usernameErr != validator.OK){
            showError(username.view ,usernameErr);
        }

        if(masterPassErr == validator.OK && urlErr == validator.OK && usernameErr == validator.OK)
            return true;
        else 
            return false;
    }

    $('.login100-form-btn').on('click', function () {

        masterPass = {
            view : input[0],
            value : $(input[0]).val().trim()
        }

        url = {
            view : input[1],
            value : $(input[1]).val().trim()
        }

        username = {
            view : input[2],
            value : $(input[2]).val().trim()
        }

        if(validate()){
            alert("algorithm runs...")
        }
    });



    function showError(input,msg) {
        var thisAlert = $(input).parent();

        
        $(thisAlert).addClass('alert-validate');

        $(thisAlert).attr("data-validate", msg);
    }


    /*==================================================================
    [ hide errors on focus ]*/
    $('.validate-form .input100').each(function () {
        $(this).focus(function () {
            hideValidate(this);
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