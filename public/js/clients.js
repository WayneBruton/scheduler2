var page;
var search;
var activeOrNot = true;

$(function () {

    $(function () {
        $("#activeYes").prop("checked", true);
        $(".activeOrNot").val(activeOrNot);
    });

    $("#activeYes").click(function (e) {
        // e.preventDefault();
        if ($(this).prop("checked") === false) {
            activeOrNot = false;
        } else {
            activeOrNot = true;
        }
        $(".activeOrNot").val(activeOrNot);

    });

    // $(window).unload(function () { 
    //     $.get('/logout');
    //   });



    $("#activeYes").change(function (e) {
        e.preventDefault();
        $("#searchInput").val("");
        $("#back").css("opacity", "0").prop("disabled", "true");
        page = 0;
        var url = '/clients/' + page + '/' + activeOrNot;
        $.get(url, function (data) {
            $('#clientData').empty();
            $.each(data, function () {
                var input = this.id + ' - ' + this.first_name + ' : ' + this.last_name;
                $('<div class="client-li"><li id="client-li">' + input + '</li><button class="edit-btn" id="' + this.id + '">Edit / View</button></div>').appendTo('#clientData');
            });
        });

    });

    $("#forward").click(function (e) {
        e.preventDefault();
        $("#back").css("opacity", "1").removeAttr("disabled");
        if (page === undefined) {
            page = 1;
        } else {
            page++;
        }

        var url = '/clients/' + page + '/' + activeOrNot;
        $.get(url, function (data) {

            $('#clientData').empty();
            $.each(data, function () {
                var input = this.id + ' - ' + this.first_name + ' : ' + this.last_name;
                $('<div class="client-li"><li id="client-li">' + input + '</li><button class="edit-btn" id="' + this.id + '">Edit / View</button></div>').appendTo('#clientData');
                if (data.length < 12) {
                    $("#forward").css("opacity", "0").prop("disabled", "true");
                } else {
                    $("#forward").css("opacity", "1").removeAttr("disabled");
                }
            });
        });
    });
    $('#clientData').on("click", ".edit-btn", function () {
        var a = $(this).attr('id');
    });

    $("#back").click(function (e) {
        e.preventDefault();
        if (page === undefined) {
            page = 1;
        } else {
            page--;
        }
        if (page === 0) {
            $("#back").css("opacity", "0").prop("disabled", "true");
        } else {
            $("#back").css("opacity", "1").removeAttr("disabled");
        }
        $("#forward").css("opacity", "1").removeAttr("disabled");

        var url = '/clients/' + page + '/' + activeOrNot;
        $.get(url, function (data) {

            $('#clientData').empty();
            $.each(data, function () {
                var input = this.id + ' - ' + this.first_name + ' : ' + this.last_name;
                $('<div class="client-li"><li id="client-li">' + input + '</li><button class="edit-btn" id="' + this.id + '">Edit / View</button></div>').appendTo('#clientData');
            });
        });
    });

    $("#searchInput").focus(function (e) {
        e.preventDefault();
        $(this).css("background-color", "yellow");
    });

    $("#searchInput").blur(function (e) {
        e.preventDefault();
        $(this).css("background-color", "rgb(255, 255, 255)");
    });

    $("#addPerson").click(function (e) {
        e.preventDefault();
        var x = (screen.width);
        var y = (screen.height)
        var swidth = (screen.width) * .6;
        var sheight = (screen.height) * .6;
        var newTop = (y - sheight) / 2;
        var newLeft = (x - swidth) / 2;
        var newMargin = (swidth - 250) / 2;

        // $(".lightbox").css("width", x).css("height", y);
        $(".lightbox").fadeIn().css("width", x).css("height", y);
        $(".lightboxA").css("width", swidth).css("height", sheight).css("top", newTop).css("left", newLeft);
        // $('.lightbox').fadeIn().css("display", "flex").css("align-items", "center");
        $('.lightboxA').fadeIn().css("display", "flex").css("align-items", "center").css("align-content", "space-around");
        $(".inputData").css("margin-left", newMargin);

        getClientTypes();

    });

    function getClientTypes() {
        const url = '/getClientTypes';
        $.get(url, function (data) {
            $(`<option value="">--Please choose an option--</option>`).appendTo('#addClientType');
            $.each(data, function (i, val) {
                val = data[i].id;
                const text = data[i].client_type_description;

                $(`<option value="${val}">${text}</option>`).appendTo('#addClientType');
            });
            var v = $('#addClientType').val();
        });
    }

    $(".lightbox,.lightbox1").click(function (e) {
        e.preventDefault();
        $(this).css("display", "none");
        editData = []; //clears edit query
    });

    $(".inputDataFields,.inputDataFields1").click(function (e) {
        e.stopPropagation();
    });

    //Search for Record
    $("#searchInput").keyup(function (e) {
        e.preventDefault();
        search = $(this).val();
        if (search === "") {
            search = '&&';
        }

        var url = '/client/' + search + '/' + activeOrNot;
        $.get(url, function (data) {

            $('#clientData').empty();
            $.each(data, function () {
                var input = this.id + ' - ' + this.first_name + ' : ' + this.last_name;
                $('<div class="client-li"><li id="client-li">' + input + '</li><button class="edit-btn" id="' + this.id + '">Edit / View</button></div>').appendTo('#clientData');
            });
        });

    });

    $('#searchInput').keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });

    $("searchEndBtn").click(function (e) {
        e.preventDefault();
        returnAll();

    });

    $("#addNewClient").click(function (e) {
        // e.preventDefault();
        // $(".lightbox").css("display", "none");

    });

    function returnAll() {

        var url = '/clientReturn';
        $.get(url, function (data) {

            $('#clientData').empty();
            $.each(data, function () {
                var input = this.id + ' - ' + this.first_name + ' : ' + this.last_name;
                $('<div class="client-li"><li id="client-li">' + input + '</li><button class="edit-btn" id="' + this.id + '">Edit / View</button></div>').appendTo('#clientData');
            });
        });
    }

    $("#addLastName,#addFirstName,#addEmail, #addClientType").focusout(function (e) {
        e.preventDefault();
        if ($(this).val() === '') {
            $(this).css("background-color", "red");
            $("#addNewClient").css("display", "none");
            $(this).focus();
        } else {
            $("#addNewClient").css("display", "block");
            $(this).css("background-color", "rgb(255, 255, 255)");
        }
        if ($('#addLastName').val() !== '' && $('#addFirstName').val() !== '' && $('#addEmail').val() !== '' && $('#addClientType').val() !== '') {
            $("#addNewClient").css("display", "block");
        } else {
            $("#addNewClient").css("display", "none");

        }
    });

    $('#addLastName,#addFirstName,#addEmail').keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });

    $('#addClientType').change(function (e) {
        e.preventDefault();
        if ($('#addLastName').val() !== '' && $('#addFirstName').val() !== '' && $('#addEmail').val() !== '' && $('#addClientType').val() !== '') {
            $("#addNewClient").css("display", "block");
        }
    });

    $("#reset").click(function (e) {
        e.preventDefault();
        $("#addLastName,#addFirstName,#addEmail, #addClientType").css("background-color", "rgb(255, 255, 255)").val('');
        $("#addLastName").focus();
        $("#addNewClient").css("display", "none");
    });

    var clientID;

    $('#clientData').on("click", ".edit-btn", function (e) {
        // modalform

        clientID = $(this).attr('id');
        e.preventDefault();
        showEditModal();
        // editData = []; //clears edit query
        // clientType = [];
        clearClientType();
        $('#editClientType').empty();

        var getClientURL = '/getclient/' + clientID;
        var getClientTypesURL = '/getClientTypes';

        $.get(getClientURL,  function (data) {
                return data;
            })
            .then(function (editData) {
                $.get(getClientTypesURL, function (clientTypes) {
                        return clientTypes;
                        // return clientTypes
                    }).then(function (clientTypes) {
                        
                        // console.log(editData);

                        fillEditInputs(editData, clientTypes);

                        console.log("Success");
                    }).then(function () {
                        editData = [];
                        // clientTypes = [];
                    })
                    .catch(function () {
                        console.log("Some Issue Here");
                    });
            });
    });


    // var editData = []; //clears edit query
    // var clientTypes = []; //clears clientType

    function clearClientType() {
        $('#editClientType').empty();
    }


    function fillEditInputs(editData, clientTypes) {
        clientTypes.forEach(function (clientType) {
            val = clientType.id
            const text = clientType.client_type_description;
            $(`<option value="${val}">${text}</option>`).appendTo('#editClientType');
        });

        $("#client-id").val(editData[0].id);
        $("#editLastName").val(editData[0].last_name);
        $("#editFirstName").val(editData[0].first_name);
        $("#editEmail").val(editData[0].email);
        $('#editClientType').val(editData[0].client_type);
        if (editData[0].active === 1) {
            $("#activeChecked1").prop("checked", true);
            $("#isActive").val(1)
            $("#activeChecked1").val(1);
            $("#inactivityReason").css("display", "none");
            $("#inactivityReasonLabel").css("display", "none");
        } else {
            $("#activeChecked1").prop("checked", false);
            $("#activeChecked1").val(0);
            $("#isActive").val(0)
            $("#inactivityReason").val(editData[0].activity_reason);
        }

        // editData = [];
        // clientTypes = [];
    }

    $("#editLastName,#editFirstName,#editEmail,#editEENumber").focusout(function (e) {
        e.preventDefault();
        if ($(this).val() === '') {
            $(this).css("background-color", "red");
            $("#editNewCarer").css("display", "none");
            $(this).focus();
        } else {
            $(this).css("background-color", "rgb(255, 255, 255)");
            $("#editNewCarer").css("display", "block");
        }
    });

    $("#resetEdit").click(function (e) {
        e.preventDefault();
        $("#editLastName,#editFirstName,#editEmail,#editEENumber").css("background-color", "rgb(255, 255, 255)");
        $("#editNewCarer").css("display", "block");
        fillEditInputs();
    });

    $("#activeChecked1").click(function (e) {
        if ($('input[name=active]').is(':checked')) {
            $("#inactivityReason").css("display", "none");
            $("#inactivityReasonLabel").css("display", "none");
            $("#inactivityReason").val("");
            $(this).val(1);
            $("#isActive").val(1)
            $(".inputData1").height(510);
        } else {
            $(this).val(0);
            $("#inactivityReason").css("display", "block");
            $("#isActive").val(0)
            $("#inactivityReasonLabel").css("display", "block");
            $(".inputData1").height(560);
        }

    });
});

function showEditModal() {
    var x = (screen.width);
    var y = (screen.height);
    var swidth = (screen.width) * .6;
    var sheight = (screen.height) * .6;
    var newTop = (y - sheight) / 2;
    var newLeft = (x - swidth) / 2;
    var newMargin = (swidth - 300) / 2;
    $(".lightbox1").fadeIn().css("width", x).css("height", y);
    $(".lightboxA1").css("width", swidth).css("height", sheight).css("top", newTop).css("left", newLeft);
    $('.lightboxA1').fadeIn().css("display", "flex").css("align-items", "center").css("align-content", "space-around");
    $(".inputData1").css("margin-left", newMargin);
}
