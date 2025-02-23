import channelSettings from "../settings/channelSettings";
import Devices from "../../src/services/deviceCenter";

/**
    * GoogleAnalytics.
    */
export default class GoogleAnalytics {
/**
    * Creates an instance of GoogleAnalytics.
    *
    * @constructor
    * @param {*} tag
    */
    constructor(tag) {
        this.name = "googleAnalytics";
        this.type = "analytics";
        this.tag = tag;    
    }

/**
    * gtag loaded status
    *
    * @static
    * @type {boolean}
    */
    static gtag_loaded=false;
/**
    * load google anlaytics
    *
    * @returns {*}
    */
    load() {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");

            script.id = "googleAnalytics";
            script.src = this.tag.src;


            script.type = "text/javascript";
            script.async = true;
            script.onload = () => resolve(this);
            script.onerror = () => reject(this);

            document.head.appendChild(script);
        });
    }

static configGtag(){
    const gtagValue = channelSettings.getPlugins('analytics')[0]?.tag.value;
    // const gtagValue = 'G-MP61L0VWQT';
    if(!gtagValue) return;

    window.gtagId = gtagValue;

    const script = document.createElement('script');
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + gtagValue;
    script.async = true;
    document.head.appendChild(script);
    
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    
    script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    
    gtag('config', '${gtagValue}', { 'debug_mode':true });
    `;

    document.head.appendChild(script2);

    GoogleAnalytics.gtag_loaded=true;    
}

/**
    * function to send the events to google analytics
    *
    * @param {{name: string, parameters: {hash: string}}} data - Event data receiving name and parameter
    * @returns {*}
    */
    // static sendEvent(data) {
    //     if(!GoogleAnalytics.gtag_loaded) this.configGtag();    
    //     const { name, parameters } = data;    
    //
    //     window.gtag("event", name, parameters);
    // }

    static sendEvent(data) {

        const gtagValue = window.gtagId;
        if(!gtagValue) return;
        const {name, parameters} = data;
        // const gtagValue = channelSettings.getPlugins('analytics')[0]?.tag.value;
        

        // use gtagjs for browser based apps
        const {platform} = window.settings;
        if(platform === "vizio" || platform === "vidaa" || platform === "zeasn" || platform === "emulator"){
            gtag("event", name, parameters);
            return;
        }

        const sid = Date.now();

        const formattedParameters = new URLSearchParams();
        for(const key in parameters){
            const value = parameters[key];
            formattedParameters.set(key, value);
        }

        // console.log(formattedParameters.toString());

        // const finalUrl = `${baseUrl}?${searchParams.toString()}`;
        (async() => {
            try{
                const seg = name === 'page_navigation' ? 1 : 0;
                const baseUrl = `https://analytics.google.com/g/collect`
                const clientId = Devices.getDeviceFieldData("getUUID");
                const theUrl = `${baseUrl}?sid=${sid}&tid=${gtagValue}&seg=${seg}&ul=en_us&uid=${clientId}&v=2&epn.time_difference=30000&en=${name}&cid=${clientId}&${formattedParameters.toString()}`

                fetch(theUrl, {method: 'POST'})
                // console.log('event status: ', res.status)
            }catch(err){
                console.log('event err: ', err)
            }
        })();
    }

/**
    * function to send an error event to google analytics
    *
    * @param {*} description
    * @param {*} fatal
    */
    static sendError(description, fatal) {
        if(!GoogleAnalytics.gtag_loaded) 
            this.configGtag();  
        window.gtag("event", "exception", {
            description,
            fatal,
        });
    }

    static measurementSetup() {
        const measurement_id = `G-MP61L0VWQT`;
        const api_secret = `Vphs10rkR-OwP0PfUJGwIg`;
        const clientId = Devices.getDeviceFieldData("getUUID");
        console.log('measurement called')

        fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`, {
            method: "POST",
            body: JSON.stringify({
                "client_id": "123456.7654321",
                "events": [
                    {
                        "name": "campaign_details",
                        "params": {
                            "campaign_id": "google_1234",
                            "campaign": "Summer_fun",
                            "source": "google",
                            "medium": "cpc",
                            "term": "summer+travel",
                            "content": "logolink",
                            "session_id": "123",
                            "engagement_time_msec": "100"
                        }
                    }
                ]
            })
        })
        .then(res => console.log('measure status: ', res.status))
        .catch(err => console.log('measure err: ', err))
    }


}
