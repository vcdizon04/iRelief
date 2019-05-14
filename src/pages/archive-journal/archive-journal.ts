import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Toast, ToastController, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import moment from 'moment';


/**
 * Generated class for the ArchiveJournalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-archive-journal',
  templateUrl: 'archive-journal.html',
})
export class ArchiveJournalPage {
  archiveJournals = [];
  isChanges=false;
  constructor(public alert: AlertController, public toast: ToastController, public navCtrl: NavController, public navParams: NavParams, public database: DatabaseProvider, public view: ViewController) {
    this.initialize();
    this.database.archiveJournals.subscribe(res => {
      console.log(res);
      this.archiveJournals = res.sort((a, b) => b.doc.date -  a.doc.date )
    } );
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ArchiveJournalPage');
  }
  initialize() {
    this.database.getAllDocs().then(res => {
      console.log(res);
      const rows: Array<any> = res.rows;
      this.archiveJournals = rows.filter(row => row.doc.type === 'archiveJournal');
      console.log(this.archiveJournals);
      this.database.archiveJournalsSource.next(this.archiveJournals);
    })
  }
  formatDate(timestamp) {
    return moment(timestamp).format("DD MMMM YYYY");
  }
  
  formatTime(timestamp) {
    return moment(timestamp).format('hh:mm A');
  }
  back(){
    this.view.dismiss(this.isChanges);
  }
  deleteJournal(journal){
    this.alert.create({
      title: "Delete Journal",
      message: "Are you sure you want to delete this journal?",
      buttons: [
        {
          text: "Cancel",
          cssClass: `alertColor-${this.database.color}`
          
        },
        {
          text: "Ok",
          cssClass: `alertColor-${this.database.color}`,
          handler: ()=>{
            this.isChanges = true;
            this.database.deleteJournal(journal.doc._id ,journal.doc._rev).then(res => {
              console.log(res);
              this.initialize();
              let toast = this.toast.create({
                message: 'Successfully deleted journal',
                duration: 3000
              });
              toast.present();
            })
          }
        }
      ]
    }).present();
  }
  restore(journal){
    this.alert.create({
      title: "Restore",
      message: "Are you sure you want to restore this journal?",
      buttons: [
        {
          cssClass: `alertColor-${this.database.color}`,
          text: "Cancel",
        },
        {
          cssClass: `alertColor-${this.database.color}`,
          text: 'Ok',
          handler: ()=>{
            this.isChanges = true;
            console.log(journal)
            this.doRestore(journal);
          }
        }
      ]
    }).present();
  }
  async doRestore(journal){
    // await this.database.deleteJournal(journal.doc._id,journal.doc._rev);
    await this.database.restoreJournal(journal.doc);
    this.initialize();
    this.toast.create({
      duration: 2000,
      message: "Journal successfully restored"
    }).present();
  }
}
