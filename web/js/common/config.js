var apikey = "8b8da770-d99c-4617-9f9a-79510505e175";
var secret="262abb49-2ffc-46c6-bdc7-cb27579b21c5";
// var p2p_session="e89cb1c0-1f66-4944-8634-006f103acb4b";
var p2p_session="314e6da1-7282-44cd-92b2-41cc99e1d6ba";
var tokens = [  "2c612c4e-4e9c-477e-8d35-a05492e83e8c",
                "d72e6f52-1d93-4ee1-b56e-bd6fa8aeed42",
                "2f2fba4a-9712-46cd-9456-9d7dc26cf733"];


function getToken() {

    var token_url = "https://api.realtimecat.com/v0.4/sessions/"
        + p2p_session + '/tokens';

    return new Promise((resolve,reject)=>{
        $.ajax({
            'url':token_url,
            'method':'POST',
            'headers':{
                'X-RTCAT-APIKEY':apikey,
                'X-RTCAT-SECRET':secret
            },
            'data':{
                'session_id':p2p_session,
                'type':'pub'
            }
        }).done(function(msg){
            resolve(msg.uuid);
        }).error(function (error) {
            console.log(error);
            reject(error);
        });
    });
}