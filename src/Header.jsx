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

function _(s){
    if (navigator.language == "ru-RU") {
        if (s in ctable_lang_ru && ctable_lang_ru[s] !== "")
            return ctable_lang_ru[s];
        else
            return s;
    }
    else
        return s;

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

function unwind_button(e){
    var tg = e.target;
    if(tg.tagName != "BUTTON"){
        tg = tg.parentElement;
    }
    return tg;
}

function unwind_tr(e){
    var tg = e.target;
    if(tg.tagName != "TR"){
        tg = tg.parentElement;
    }
    return tg;
}
