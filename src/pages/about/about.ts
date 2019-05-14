import { Component } from '@angular/core';
import { NavController, AlertController, App, ModalController, LoadingController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Entry } from '../../model/entry';
import { Subscription } from 'rxjs';
import { SelectEmotionPage } from '../select-emotion/select-emotion';
import moment from 'moment';
import { JournalActionPage } from '../journal-action/journal-action';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  name: String = '';
  entries: Array<Entry> = [];
  currentEntryId: String = '';
  $subscription: Subscription;
  $subscription2: Subscription;
  isDeleteEntry: Boolean;
  auotoDeleteEntryInterval;
  constructor(public loading: LoadingController, public navCtrl: NavController, public database: DatabaseProvider, public alert: AlertController, private app: App, public modal: ModalController) {
    console.log('entriesPage', this.database.currentEntryId)
    this.currentEntryId = this.database.currentEntryId;
    // this.database.getAllDocs().then(res => {
    //   const rows: Array<any> = res.rows;
    //   this.name = rows.filter(row => row.doc.type === 'user')[0].doc.name;
    // })  
    this.database.user.subscribe(res => {
      const user: any = res;
      this.name = user.name;
    })
    this.database.getAllDocs().then(res => {
      const rows: Array<any> = res.rows;
     const entries = rows.filter(row => row.doc.type === 'entry').reverse();
     this.database.entriesSource.next(entries);
    })  
    this.$subscription = this.database.entries.subscribe(res => {
      console.log(res)
      this.entries = res.sort((a,b) => b.doc.date - a.doc.date);
      
      if(res.length > 0 ) {
        if(this.entries.findIndex((element) => {
          const entry: any = element;
          return entry.doc._id === this.currentEntryId
        }) >= 0 ) {
          this.currentEntryId = this.currentEntryId
        } else {
          this.currentEntryId = this.entries[0].doc._id;
        }
      }

    })
    
  }
async automaticDeleteEntry(){
  if(this.entries.length > 0){
    const loader = this.loading.create({
      content: 'Loading Entries Please wait..'
    })
    let isDelete = false;
    let index = 0;
    for(let entry of this.entries){
      const currentDate = new Date();
      const date:any = entry.doc.date;
      const journalDate = new Date(date);
      journalDate.setHours(journalDate.getHours() + 24)
      console.log(journalDate , currentDate)
      console.log(journalDate.getTime() <= currentDate.getTime())
      if(journalDate.getTime() <= currentDate.getTime()){
        console.log(loader.instance)
        if(!loader.instance){
            loader.present();
        }
        await  this.database.deleteEntry( entry.doc._id , entry.doc._rev);
        isDelete = true;

        // const res = await  this.database.getAllDocs()
        // const rows: Array<any> = res.rows;
        // const entries = rows.filter(row => row.doc.type === 'entry').reverse();
        // this.database.entriesSource.next(entries);
        // this.isDeleteEntry = true;
      }
      index++;
      // if(index == this.entries.length - 1){
      //   console.log(loader.instance)
      //   if(loader.instance){
      //     loader.dismiss();
      //   }
      // }
    }
    if(isDelete){
      const res = await  this.database.getAllDocs()
      const rows: Array<any> = res.rows;
      const entries = rows.filter(row => row.doc.type === 'entry').reverse();
      this.database.entriesSource.next(entries);
      this.isDeleteEntry = true;
    }
    if(loader.instance){
      loader.dismiss();
    }

  }
}

 async deleteEntry(id , rev, event) {
  console.log('ebent',event);
  event.stopPropagation();
    const alert = await this.alert.create({
      message: 'Are you sure you want to <strong>delete</strong> this entry?',
      title: 'Confirmation!',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.database.deleteEntry(id , rev).then(res => {
              this.database.getAllDocs().then(res => {
                const rows: Array<any> = res.rows;
               const entries = rows.filter(row => row.doc.type === 'entry').reverse();
               this.database.entriesSource.next(entries);
               this.isDeleteEntry = true;
              })  
            })
          }
        }
      ]
    });

    await alert.present();
  }

  createEntry() {
    const modal = this.modal.create(SelectEmotionPage);
    modal.present();
  }

  formatDate(timestamp) {
    return moment(timestamp).format('DD MMMM YYYY');
  }
  formatTime(timestamp) {
    return moment(timestamp).format('hh:mm A');
  }
  createJournal(){
    const modal = this.modal.create(JournalActionPage, {action: 'Create Journal'});
    modal.present();
    modal.onDidDismiss(isChanges => {
      if(isChanges) {
        // this.initialize();
      }
    })
  }
  selectEntry(id) {
    this.database.currentEntryId = id;
    this.currentEntryId = id;
    this.navCtrl.parent.select(0);
  }
  formatDateActivity(timestamp){
    return moment(timestamp).format('DD/MM/YYYY');
  }

  ionViewWillEnter(){
   console.log('View Enter');
   this.auotoDeleteEntryInterval = setInterval(()=> { this.automaticDeleteEntry(); }, 1000);
  }
  ionViewWillLeave(){
   console.log('View Leave');
    clearInterval(this.auotoDeleteEntryInterval);
  }
}
