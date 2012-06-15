/*
 * Copyright (c) Novedia Group 2012.
 *
 *     This file is part of Hubiquitus.
 *
 *     Hubiquitus is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     Hubiquitus is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with Hubiquitus.  If not, see <http://www.gnu.org/licenses/>.
 */

function connect(){
    var endpoint = document.getElementById('endpoint').value;
    var endpoints = endpoint ? [endpoint] : undefined;

    var transports =  document.getElementsByName('transport');
    var transport = undefined;
    for (var i=0; i < transports.length; i++)
        if(transports[i].checked)
            transport = transports[i].value;

    var hOptions = {
        serverHost: document.getElementById('serverHost').value,
        serverPort: document.getElementById('serverPort').value,
        transport: transport,
        endpoints: endpoints
    };

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    hClient.onMessage = onMessage;
    hClient.onStatus = onStatus;
    hClient.connect(username, password, hOptions);
}

function disconnect(){
    hClient.disconnect();
}

function publish(){
    var chid = document.getElementById('chid').value;
    var msg = document.getElementById('hMessage').value;
    var fct = function (hresult) {onResult(hresult)};
    /*hClient.publish(hClient.buildMessage(chid, 'string', msg, {
        transient: !!document.getElementById("hMessageTransient").checked
    }), fct);*/
    hClient.publish(null, fct);
}

function subscribe(){
    var chid = document.getElementById('chid').value;
    var fct = function (hresult) {onResult(hresult)};
    hClient.subscribe(chid, fct)
}

function unsubscribe(){
    var chid = document.getElementById('chid').value;
    var fct = function (hresult) {onResult(hresult)};
    hClient.unsubscribe(chid, fct)
}

function get_messages(){
    var chid = document.getElementById('chid').value;
    var quantity = prompt('Max Messages (can be empty):');
    var fct = function (hresult) {onResult(hresult)};
    hClient.getLastMessages(chid, quantity, fct);
}

function get_subscriptions(){
	var fct = function (hresult) {onResult(hresult)};
    hClient.getSubscriptions(fct);
}

function clear_divs(){
    document.getElementById("status").innerHTML = 'Status: ';
    document.getElementById("hmessage").innerHTML = '';
    document.getElementById("resultsDiv").innerHTML = '';
}

function send_hEcho(){
    if(!hClient.publisher || hClient.publisher.split('@').length != 2)
        alert('Please connect before trying to send an hEcho');
    else{
        var value = prompt('Your Name:');
        var echoCmd = {
            entity : 'hnode.' + hClient.publisher.split('@')[1],
            cmd : 'hEcho',
            params : {hello : value},
            transient : !!document.getElementById("transientCheckBox").checked
        };
        var fct = function (hresult) {onResult(hresult)};
        hClient.command(echoCmd, fct);
    }

}

function build_measure(){
    var value = prompt('Value:');
    var unit = prompt('Unit:');
    var chid = prompt('Channel:');
    var hMessage = hClient.buildMeasure(chid, value, unit, {
        transient: !!document.getElementById("hMessageTransient").checked
    });
    if(hMessage)
        console.log('Created hMessage', hMessage);
    if(document.getElementById("sendBuiltMessage").checked)
        hClient.publish(hMessage, console.log);
}

function build_alert(){
    var alert = prompt('Alert:');
    var chid = prompt('Channel:');
    var hMessage = hClient.buildAlert(chid, alert, {
        transient: !!document.getElementById("hMessageTransient").checked
    });
    if(hMessage)
        console.log('Created hMessage', hMessage);
    if(document.getElementById("sendBuiltMessage").checked)
        hClient.publish(hMessage, console.log);
}

function build_ack(){
    var ackID = prompt('AckID:');
    var ack= prompt('Ack (recv|read):');
    var chid = prompt('Channel:');
    var hMessage = hClient.buildAck(chid, ackID, ack, {
        transient: !!document.getElementById("hMessageTransient").checked
    });
    if(hMessage)
        console.log('Created hMessage', hMessage);
    if(document.getElementById("sendBuiltMessage").checked)
        hClient.publish(hMessage, console.log);
}

function build_conv(){
    var topic = prompt('Topic:');
    var participants = prompt('Participants (comma separated):');
    participants = participants.replace(/ /g, '').split(',');
    var chid = prompt('Channel:');
    var hMessage = hClient.buildConv(chid, topic, participants, {
        transient: !!document.getElementById("hMessageTransient").checked
    });
    if(hMessage)
        console.log('Created hMessage', hMessage);
    if(document.getElementById("sendBuiltMessage").checked)
        hClient.publish(hMessage, console.log);
}

function onStatus(hStatus){
    console.log('Received hStatus', hStatus);
    var status,error;

    switch(hStatus.status){
        case hClient.statuses.CONNECTED:
            status = 'Connected';
            break;
        case hClient.statuses.CONNECTING:
            status = 'Connecting';
            break;
        case hClient.statuses.REATTACHING:
            status = 'Reattaching';
            break;
        case hClient.statuses.REATTACHED:
            status = 'Reattached';
            break;
        case hClient.statuses.DISCONNECTING:
            status = 'Disconnecting';
            break;
        case hClient.statuses.DISCONNECTED:
            status = 'Disconnected';
            break;
    }

    switch(hStatus.errorCode){
        case hClient.errors.NO_ERROR:
            error = 'No Error Detected';
            break;
        case hClient.errors.JID_MALFORMAT:
            error = 'JID Malformat';
            break;
        case hClient.errors.CONN_TIMEOUT:
            error = 'Connection timed out';
            break;
        case hClient.errors.AUTH_FAILED:
            error = 'Authentication failed';
            break;
        case hClient.errors.ATTACH_FAILED:
            error = 'Attach failed';
            break;
        case hClient.errors.ALREADY_CONNECTED:
            error = 'A connection is already opened';
            break;
        case hClient.errors.TECH_ERROR:
            error = 'Technical Error: ';
            error += hStatus.errorMsg;
            break;
        case hClient.errors.NOT_CONNECTED:
            error = 'Not connected';
            break;
        case hClient.errors.CONN_PROGRESS:
            error = 'A connection is already in progress';
            break;
    }

    document.getElementById("status").innerHTML = 'Status: ' + status + ' / ' + error;
}

function onResult(hresult) {
	document.getElementById("resultsDiv").innerHTML = JSON.stringify(hresult);
}

function onMessage(hMessage){
    document.getElementById("hmessage").innerHTML = JSON.stringify(hMessage);
}