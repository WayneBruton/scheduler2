$(function() {


    $('#submitBtn').click(function (e) { 
        e.preventDefault();
        if ($('#username').val() === '' || $('#inputEmail').val()=== '') {
            return $('.alert-danger').text('Fields cannot be blank').css('display', 'block');
        }
        let username = $('#username').val();
        let userEmail = $('#inputEmail').val();
        var userData = [];
        token = '';
        var url = `/resetpassword/${username}/${userEmail}`;
        $.get(url, function (data) {
            userData = data
            token = data.token; 
        }).done(function (response) {
            if (userData.data.length === 0) {
                $('.alert-danger').text('The user name and / or the email are not on the system!').css('display','block');
                $('.alert-success').css('display','none');
                setTimeout(() => {
                $('.alert-danger').css('display','none');
                $('#username').val('');
                $('#inputEmail').val('');
                }, 3000);
                window.localStorage.removeItem('PasswordToken');
            } else {
                $('.alert-success').css('display','block');
                $('.alert-danger').text('The user name and / or the email are not on the system!').css('display','none');
                window.localStorage.setItem('PasswordToken', token);
                $('#resetForm').css('display', 'block');
                $('#initialForm').css('display', 'none');
                $('#usernameChange').val(userData.data[0].username);
                setTimeout(() => {
                    $('.alert-success').css('display','none');
                }, 3000)
            }         
        }).fail(function (response) {
            console.log(response)
        }); 
    });

    $('#passwordChange').keyup(function (e) { 
        var lowercase = /(?=.*[a-z])/;
        var uppercase = /(?=.*[A-Z])/
        var numbers = /(?=.*[0-9])/;
        var ultimate =  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
        var specialChars = /(?!.*\s)/;
        let lengthString = '- minimum of 8 characters';
        let lowercaseString = '- 1 lowercase letter';
        let uppercaseString = '- 1 uppercase letter';
        let numbersString = '- 1 number';
        let specialString = '- 1 special character';
        var str = $(this).val().split("");
        if (str.length >7) {
            lengthString = '';
        }
        str.forEach(element => {
            var lower = element.match(lowercase);
            var upper = element.match(uppercase);
            var num = element.match(numbers);
            var specChar = element.match(specialChars);
            if (lower) { lowercaseString = '' };
            if (upper) { uppercaseString = ''};
            if (num) { numbersString = ''}
            if (specChar) { specialString = ''}  
        });
        if (lowercaseString != '' || uppercaseString != '' || numbersString != '' || lengthString != '' || specialString != '') {
            var message = `Must have: ${lengthString} ${lowercaseString} ${uppercaseString} ${numbersString} ${specialString}`
        } else {
            var message = ''
        }
        if (message != '') {
            $('#passwordMessage').css('display', 'block').text(message);
        } else {
            $('#passwordMessage').css('display', 'none');
        }
    });
 
});