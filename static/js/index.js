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
        var ajaxRunObj = $.ajax({
            url:"ajaxRun.php?token=6e12c60a96ad6517471294007f663ec4",
            type:"post",
            timeout:1000,
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
                console.log(status);
                if (status == 404) {
                    msgTip('请配置ajaxRun.php','error');
                } else if (textStatus=='timeout'){
                    ajaxRunObj.abort();
                    msgTip('运行超时，请检查！','error');
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

codeHelper.localData = {
    userData: null,
    name: location.hostname,
    isLocalStorage: typeof localStorage == 'undefined'?false:true,
    init: function(){
        if (!this.userData) {
            try {
                this.userData = document.createElement('INPUT');
                this.userData.type = "hidden";
                this.userData.style.display = "none";
                this.userData.addBehavior ("#default#userData");
                document.body.appendChild(this.userData);
                var expires = new Date();
                expires.setDate(expires.getDate()+365);
                this.userData.expires = expires.toUTCString();
            } catch(e) {
                return false;
            }
        }
        return true;
    },
    set: function(key, value) {
        if(this.isLocalStorage){
            localStorage.setItem(key, value);
        }
        else if(this.init()){
            this.userData.load(this.name);
            this.userData.setAttribute(key, value);
            this.userData.save(this.name);
        }
    },
    get: function(key) {
        if(this.isLocalStorage){
            return localStorage.getItem(key);
        }
        else if(this.init()){
            this.userData.load(this.name);
            return this.userData.getAttribute(key)
        }
        return null;
    },
    remove: function(key) {
        if(this.isLocalStorage){
            localStorage.removeItem(key);
        }
        else if(this.init()){
            this.userData.load(this.name);
            this.userData.removeAttribute(key);
            this.userData.save(this.name);
        }
    }
};

//定时将代码保存到本地空间里面
setInterval(function(){
    var code = editor.getValue();
    if (code) {
        codeHelper.localData.set('code',code);
    }
},2000);

//初始化本地保存的代码
(function() {
    var code = codeHelper.localData.get('code');
    if (code) {
        codeHelper.insertContent(code, 1, 0);
    }
}());


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