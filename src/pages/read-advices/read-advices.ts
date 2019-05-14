import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { DatabaseProvider } from '../../providers/database/database';
import { StopWatchPage } from '../stop-watch/stop-watch';

import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media';

/**
 * Generated class for the ReadAdvicesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-read-advices',
  templateUrl: 'read-advices.html',
})
export class ReadAdvicesPage {
  isYoutube: Boolean;
  title: String = '';
  datas: Array<any>
  constructor(private streamingMedia: StreamingMedia, public navCtrl: NavController, public navParams: NavParams, public view: ViewController, public dom: DomSanitizer, public database: DatabaseProvider) {
    this.datas = this.navParams.get('data');
    this.title = this.navParams.get('type');
    console.log(this.datas);
    if(this.title === 'WATCH MOTIVATIONAL' || this.title === "LISTEN TO MUSIC") {
      this.isYoutube = true;
    }
    if(this.title !== 'STRETCH YOUR MUSCLES'){
      this.database.insertEntryLogs( this.navParams.get('type').toLowerCase()).then(res => {
        console.log(res);
        this.database.refreshEntries();
      })
    }
  }
  formatVideo(url){
    return this.dom.bypassSecurityTrustResourceUrl(url);
  }
  playVideo(url){
    let options: StreamingVideoOptions = {
      successCallback: () => { console.log('Video played') },
      errorCallback: (e) => { console.log('Error streaming') },
      orientation: 'landscape',
      shouldAutoClose: true,
      controls: true
    };
    this.streamingMedia.playVideo(url, options);
  }

  async ionViewDidLoad() {
    console.log('ionViewDidLoad ReadAdvicesPage');
    // if(this.isYoutube){
    //   this.datas.forEach((value, index) => {
    //     const video: any = document.getElementsByTagName('iframe')[index];
    //     video.src = 'https://www.youtube.com/embed/' + value;
    //   });
    // }
    for(let i =0 ; i< document.getElementsByTagName('audio').length; i++){
      console.log(i)
      document.getElementsByTagName('audio')[i].addEventListener("play", function () {

      for(let j =0 ; j< document.getElementsByTagName('audio').length; j++){
        console.log(i, j)
        if(j !== i){
          document.getElementsByTagName('audio')[j].pause();	
          document.getElementsByTagName('audio')[j].currentTime = 0;
        }
      }
 
    });
    }
  }

  gotoStopWatch(data) {
    if(this.title === 'STRETCH YOUR MUSCLES') {
      let modal = this.database.createModal(StopWatchPage, {data: data});
      modal.present();
    }
  }

}
