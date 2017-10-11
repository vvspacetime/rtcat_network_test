var stream,session,publisher,isStarted;

const config = {
    server: {
        display: "server",
        value  : "",
        options: ["wss://sfu.turn.rtcat.cn:8899", "wss://127.0.0.1:8989", ],
    },
    route:  {
        display: "route",
        value  : "",
        options: ["beijing","guangdong","shanghai","sichuan"],
    },
    log:    {
        display: "log",
        value  : "no",
        options: ["no", "yes"],
    },
    media:  {
        display:    "media",
        value:      "av",
        options:    ["av","audio","video","screen"],
    },
};

const switchStart = function () {
    let button = sel("#bt_start");

    if (isStarted) {
        isStarted = false;
        publisher = null;
        session.disconnect();
        session = null;
        stream.stop();
        stream = null;

        sel("#bt_publish").disabled = true;
        sel("#bt_publish").textContent = "开始推流";
        while (sel("#remotes").firstChild) {
            sel("#remotes").removeChild(sel("#remotes").firstChild);
        }
        button.textContent = "开始";
        button.disabled = false;
    } else {
        isStarted = true;
        let s = start();
        co(s);
        button.textContent = "停止";
        button.disabled = false;
    }
};

const switchPublish = function () {
    let button = sel("#bt_publish");

    const bindEvents = publisher => {
        publisher.on("connected",function () {
            log("publisher connected");
        });
        publisher.on("closed",function () {
            log("publisher closed")
        });
        publisher.on("log",function (_log) {
            if (config["log"]["value"] == "yes"){
                log("publisher log: " + JSON.stringify(_log));
            }
        });
    };

    const doSwitch = () =>{
        if(publisher){
            session.unPublish(publisher).then(publisher=>{
                log("session unpublish success");
                button.disabled = false;
            }).catch(function (e) {
                log("session unpublish error",e);
            });

            publisher = null;
            button.textContent = "开始推流";
        }else {
            publisher = session.createPublisher(stream);
            bindEvents(publisher);

            session.publish(publisher).then(publisher => {
                log("session publish success");
                button.disabled = false;
            }).catch(e => {
                log("session publish error",e);
            });
            button.textContent = "停止推流"
        }
    };

    doSwitch();
};

const createSubscriber = function (tokenId) {
    let subscriber;
    let stream;
    let button;
    let id;

    const addElem = () =>{
        id = "subscribe_" + tokenId;
        let html = `
                    <div class="col-md-2" style="margin-top: 10px" id="${id}">
                       <div>
                        <h5>发布者：${tokenId.substring(0,5)}</h5>
                        <button class="btn btn-default" id="bt_${id}">开始订阅</button>
                        </div> 
                    </div>
                    `;

        sel("#remotes").insertAdjacentHTML("beforeend",html);
        button = sel(`#bt_${id}`);
        button.addEventListener("click",e => {
            onclick();
        });
    };

    const bindEvents = subscriber => {
        subscriber.on("connected", function () {
            log("subscriber(" + subscriber.tokenId + ") connected");
        });

        subscriber.on("closed", function () {
            log("subscriber(" + subscriber.tokenId + ") closed");
        });

        subscriber.on("stream", function (_stream) {
            stream = _stream;
            stream.play(id, {size: {width: 100, height: 100}});
            log("subscriber(" + subscriber.tokenId + ") stream");
        });

        subscriber.on("log", function (_log) {
            if (config["log"]["value"] == "yes"){
                log(`subscriber(${tokenId}) log: ${JSON.stringify(_log)}`);
            }
        });
    };

    const onclick = () => {
        button.disabled = true;
        if (subscriber) {
            session.unSubscribe(subscriber).then(function () {
                log("session unsubscribe success " + subscriber.tokenId);
                subscriber      = null;
                button.disabled = false;
            }).catch(function (e) {
                loge(e);
            });

            if (stream) {
                stream.stop();
            }
            button.textContent = "开始订阅";
        } else {
            subscriber = session.createSubscriber(tokenId);
            bindEvents(subscriber);
            session.subscribe(subscriber).then(() => {
                log("session subscribe success " + subscriber.tokenId);
                button.disabled = false;
            }).catch(e => {
                loge(e);
            });
            button.textContent = "停止订阅";
        }
    };

    addElem();
};

const bindSessionEvent = function (session) {
    session.on("connected",function (routes) {
        log("session connect");
        log("routes :" + JSON.stringify(routes));
        sel("#bt_publish").disabled = false;
    });

    session.on("disconnected",function () {
        log("session disconnect")
    });

    session.on("published",function (tokenId,attr) {
        log("session published: "+ tokenId + " attr:" + JSON.stringify(attr));
        createSubscriber(tokenId)
    });

    session.on("unpublished",function (tokenId) {
        log("session unpublished: " + tokenId);
        let id = "subscribe_" + tokenId;
        let div = document.getElementById(id);
        if(div){
            sel("#remotes").removeChild(div);
        }
    });

    session.on("error_msg",function (msg) {
        console.log(msg);
        // session.disconnect();todo
        // connect(token);
    });
};

const start = function* () {
    let token = yield getToken(p2p_sessions[0]);
    let list = {
        "av":RTCat.STREAM_TYPE.AV,
        "audio":RTCat.STREAM_TYPE.AUDIO,
        "video":RTCat.STREAM_TYPE.VIDEO,
        "screen":RTCat.STREAM_TYPE.SCREEN,
    };
    let streamConfig = {
        size: {width: 640, height: 480},
        type: list[config.media.value],
    };

    stream = yield RTCat.createStream(streamConfig);
    stream.play('local',{size:{width:100,height:100}});
    session = RTCat.createSFUSession(token,{
        url:config.server.value,
        route:config.route.value,
        attr:{platform:"web"},
    });
    bindSessionEvent(session);
    session.connect();
};

const bindEvents = function () {
    sel("#bt_start").addEventListener("click",e=>{
        sel("#bt_start").disabled = true;
        switchStart();
    });

    sel("#bt_publish").addEventListener("click",e=>{
        sel("#bt_publish").disabled = true;
        switchPublish();
    });
};

const __main = function () {
    appendSelectorToHtml(config);
    bindEvents();
};

__main();