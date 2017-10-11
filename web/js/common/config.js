const sel = e => document.querySelector(e);
const log = console.log.bind(console);

var apikey = "8b8da770-d99c-4617-9f9a-79510505e175";
var secret = "262abb49-2ffc-46c6-bdc7-cb27579b21c5";

var p2p_sessions = [
    "8160a3c5-2a6b-4239-97e8-2d37a6434bdd",
    "ad347eda-b2d0-42b9-845f-5dae5fc963e1",
    "189a3f7d-ae92-4d35-856d-2d0c1f54ad5d",
    "aa2b333b-1ca4-431d-9804-a2bff8799acb",
];

var tokens = [
    "2c612c4e-4e9c-477e-8d35-a05492e83e8c",
    "d72e6f52-1d93-4ee1-b56e-bd6fa8aeed42",
    "2f2fba4a-9712-46cd-9456-9d7dc26cf733",
];


function getToken(p2p_session) {

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