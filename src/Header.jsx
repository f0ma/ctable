var { Component, h, render, Fragment, createRef } = window.preact;

function makeID() {
    let ID = "";
    let characters = _("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
    for ( var i = 0; i < 12; i++ ) {
        ID += characters.charAt(Math.floor(Math.random() * 36));
    }
    return ID;
}

//Quick multilanguage support

var ctable_lang = "ru-RU"; // navigator.language

function _(s){
    if (ctable_lang == "ru-RU") {
        if (s in ctable_lang_ru && ctable_lang_ru[s][1] !== "")
            return ctable_lang_ru[s][1];
        else
            return s;
    }
    else
        return s;

}

function N_(s1,s2,n){
    plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);

    if (ctable_lang == "ru-RU") {
        if (s1 in ctable_lang_ru && ctable_lang_ru[s1][plural+1] !== "")
            return ctable_lang_ru[s1][plural+1].replace("%d", n);
        else
            return (n == 1 ? s1 : s2).replace("%d", n);;
    }
    else
        return (n == 1 ? s1 : s2).replace("%d", n);;

}

// Class fabric

var ctable_classes = {};

function ctable_register_class(cname, cl){
    ctable_classes[cname] = cl;
}

function ctable_class_by_name(cname){
    return ctable_classes[cname];
}

function ctable_construct_by_name(cname, options){
    return h(ctable_classes[cname], options);
}


// Get cookie from
// https://stackoverflow.com/a/15724300/4265407

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function getCTablesJWT() {
    token = getCookie("ctables-jwt");
    if(!token) return null;
    var sdata = atob(token.split('.')[1]);
    return JSON.parse(sdata);
}


// This functions adopted from Just Clone library
// https://github.com/angus-c/just
// Copyright by Contributors:
// https://github.com/angus-c/just/graphs/contributors
// Under the terms of MIT License
// Source file:
// https://github.com/angus-c/just/blob/master/packages/collection-clone/index.mjs

function clone(obj) {
    if (typeof obj == 'function') {
        return obj;
    }
    var result = Array.isArray(obj) ? [] : {};
    for (var key in obj) {
        // include prototype properties
        var value = obj[key];
        var type = {}.toString.call(value).slice(8, -1);
        if (type == 'Array' || type == 'Object') {
            result[key] = clone(value);
        } else if (type == 'Date') {
            result[key] = new Date(value.getTime());
        } else if (type == 'RegExp') {
            result[key] = RegExp(value.source, getRegExpFlags(value));
        } else {
            result[key] = value;
        }
    }
    return result;
}

function getRegExpFlags(regExp) {
    if (typeof regExp.source.flags == 'string') {
        return regExp.source.flags;
    } else {
        var flags = [];
        regExp.global && flags.push('g');
        regExp.ignoreCase && flags.push('i');
        regExp.multiline && flags.push('m');
        regExp.sticky && flags.push('y');
        regExp.unicode && flags.push('u');
        return flags.join('');
    }
}

// End of adopted code

function cls(...x){
    return x.join(' ');
}

function sty(...x){
    var stychunks = [];
    for(var i = 0; i < x.length; i += 2)
    {
        stychunks.push(x[i] + ":" + x[i+1] + ";");
    }

    return stychunks.join(' ');
}

function unwind_button_or_link(e){
    var tg = e.target;
    if(tg.tagName != "BUTTON" && tg.tagName != "A"){
        tg = tg.parentElement;
    }
    return tg;
}

function unwind_tr(e){
    var tg = e.target;
    if(tg.tagName != "TR"){
        tg = unwind_tr({target:tg.parentElement});
    }
    return tg;
}


function unwind_th(e){
    var tg = e.target;
    if(tg.tagName != "TH"){
        tg = unwind_tr({target:tg.parentElement});
    }
    return tg;
}

function unwind_data(e, data){
    var tg = e.target;
    if (data in tg.dataset)
        return tg.dataset[data];
    return unwind_data({target:tg.parentElement}, data);
}

function deep_copy(x) {
    return JSON.parse(JSON.stringify(x));
}
