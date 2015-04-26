ZeroClipboard.config({
    debug: false,
    swfPath: './assets/zeroclipboard/ZeroClipboard.swf'
});

var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    matchBrackets: true,
    mode: "application/x-httpd-php",
    keyMap: "sublime",
    indentUnit: 4,
    theme: "monokai",
    indentWithTabs: true,
    autofocus: true
});
emmetCodeMirror(editor);

var codeHelper = {
    run : function () {
        var code = editor.getValue();
        if (!code) {
            $('#codeTip').show();
            setTimeout(function(){
                $('#codeTip').hide();
            },2500);
            return false;
        };
        $.ajax({
            url:"run.php?token=59f9e9cf651d84d8c4065e7dc12a1fa9",
            type:"post",
            cache:false,
            data:{code:code},
            success:function(data){
                if (data) {
                    $('#runResultHtml').val(data);
                    $('#runResult').html(data);
                } else {
                    $('#preview').val('数据返回为空！');
                }
                $("#runButton").html('运行程序').removeAttr('disabled');
            },
            beforeSend:function(){
                $("#runButton").html('运行中...').attr('disabled','disabled');
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var status = XMLHttpRequest.status;
                if (status == 404) {
                    msgTip('请配置run.php','error');
                } else {
                    msgTip('运行失败，请检查！','error');
                }
                $("#runButton").html('运行程序').removeAttr('disabled');
            }
        });
    },
    reset : function () {
        editor.setValue('');
        editor.focus();
    },
    insertPhp : function () {
        codeHelper.insertContent("<?php\r\n\r\n?>", 1, 0);
    },
    insertHtml : function () {
        codeHelper.insertContent("<!doctype html>\r\n<html>\r\n<head>\r\n<title>Web开发助手 - Power by 徐宗胜</title>\r\n<meta charset=\"utf-8\" />\r\n</head>\r\n<body>\r\n\r\n</body>\r\n</html>", 7, 0);
    },
    insertPhpPreg : function () {
        codeHelper.insertContent("<?php\r\n$pattern = \"/test/\";\r\n$content = \"test\";\r\n$result  = preg_match($pattern, $content, $dataArr);\r\nvar_dump($result);\r\nvar_dump($dataArr);\r\n?>", 1, 15);
    },
    insertContent : function(content,line,ch) {
        //editor.replaceRange("<!doctype html>\r\n<html>\r\n<head>\r\n<title>Web开发助手 - Power by 徐宗胜</title>\r\n<meta charset=\"utf-8\" />\r\n</head>\r\n<body>\r\n\r\n</body>\r\n</html>",pos);
        var rng = editor.getSelection();
        if (rng) {
            editor.replaceSelection(content,rng);
            var pos = editor.getCursor(rng);
        } else {
            var pos = editor.getCursor();
            editor.replaceSelection(content,rng);
        }
        editor.setCursor(pos.line+line,pos.ch+ch);//editor.setCursor(pos.line+1,pos.ch+5);
        editor.focus();
    }
}

//复制插件
$('.btn-copy-clipboard').each(function(){
    var __self = $(this);
    var client = new ZeroClipboard(__self);
    client.on('copy', function (e) {
        var client = e.client;
        var type = __self.attr('copyObj');
        var value = '';
        if (type == 'code') {
            value = editor.getValue();
        } else {
            value = $('#'+type).val();
        }
        client.setText(value);
    });
    client.on('aftercopy', function () {
        msgTip('复制成功！','success');
    });
});

$('.form-tab-bar span').click(function(){
    var id = $(this).attr('rel');
    $('.tools-run-result').hide();
    $('#'+id).show();
    $(this).addClass('current').siblings().removeClass('current');
    if (id == "runResultHtml") {
        $('#'+id).focus();
    }
});
var msgTipTimeout = null;
function msgTip(content,type) {
    clearTimeout(msgTipTimeout);
    if (type == 'error') {
        $('#msgTip').removeClass('alert-success').addClass('alert-danger');
        content = '<i class="glyphicon glyphicon-remove-sign"></i> ' + content;
    }
    if (type == 'success') {
        $('#msgTip').removeClass('alert-danger').addClass('alert-success');
        content = '<i class="glyphicon glyphicon-ok-sign"></i> ' + content;
    }
    $('#msgTip').html(content);
    $('#msgTip').fadeIn();
    msgTipTimeout = setTimeout(function(){
        $('#msgTip').fadeOut();
    },2500);
}

//北京时间
(function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;
    $('#showBeijingTime').html("北京时间：" + h + ":" + m + ":" + s);
    var t = setTimeout(function(){
        startTime();
    },1000);
}());