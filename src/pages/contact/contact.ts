import { Component } from '@angular/core';
import { NavController, ModalController, ToastController, ViewController, AlertController } from 'ionic-angular';
import { SelectEmotionPage } from '../select-emotion/select-emotion';
import { JournalActionPage } from '../journal-action/journal-action';
import { DatabaseProvider } from '../../providers/database/database';
import { Journal } from '../../model/journal';
import moment from 'moment';
import { ChangePasswordPage } from '../change-password/change-password';
import { TabsPage } from '../tabs/tabs';
import { ArchiveJournalPage } from '../archive-journal/archive-journal';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  user;
  password: String;
  confirmpassword: String;
  navbarColor= "light";
  journals: Array<any> = [];
  title = 'My Journal';
  isJournalPasswordSet: boolean;
  isLogin: boolean;
  backColor= this.database.color; 
  constructor(public navCtrl: NavController, public modal: ModalController, public database: DatabaseProvider, public toast: ToastController, public alert: AlertController) {
    this.database.user.subscribe(res => {
      this.user = res;
      console.log(this.user);
      if(this.user.password) {
        this.title = "My Journal";
        this.navbarColor = 'light';
        this.backColor = this.database.color
        this.isJournalPasswordSet = true;
      } else {
        this.title = "Set-up Password";
        this.navbarColor = this.database.color;
        this.backColor = "light"

      } 
    })
    this.initialize();
    this.database.journals.subscribe(res => this.journals = res.sort((a, b) => b.doc.date -  a.doc.date ) );
  }
  ionViewWillEnter(){
   console.log('view enter')
   document.getElementsByClassName('tab-button')[0].className = `${document.getElementsByClassName('tab-button')[0].className} hidden`
   document.getElementsByClassName('tab-button')[1].className = `${document.getElementsByClassName('tab-button')[1].className} hidden`

  }
  ionViewWillLeave(){
    console.log('view leave')
    document.getElementsByClassName('tab-button')[0].className = document.getElementsByClassName('tab-button')[0].className.replace('hidden', 'visible')
    document.getElementsByClassName('tab-button')[1].className = document.getElementsByClassName('tab-button')[1].className.replace('hidden', 'visible')
 
  }
  createEntry() {
    const modal = this.modal.create(SelectEmotionPage);
    modal.present();
  }
  createJournal(){
    const modal = this.modal.create(JournalActionPage, {action: 'Create Journal'});
    modal.present();
    modal.onDidDismiss(isChanges => {
      if(isChanges) {
        this.initialize();
      }
    })
  }
  readJournal(journal){
    const modal = this.modal.create(JournalActionPage, {action: this.formatDate(journal.doc.date), journal: journal});
    modal.present();
    modal.onDidDismiss(isChanges=> {
      if(isChanges) {
        this.initialize();
      }
    })
  }
  formatDate(timestamp) {
    return moment(timestamp).format("DD MMMM YYYY");
  }
  formatTime(timestamp) {
    return moment(timestamp).format('hh:mm A');
  }
  initialize() {
    this.database.getAllDocs().then(res => {
      const rows: Array<any> = res.rows;
      this.journals = rows.filter(row => row.doc.type === 'journal');
      console.log(this.journals);
      this.database.journalsSource.next(this.journals);
    })
  }
  back(){
    this.navCtrl.parent.select(0, {
      animation: true, direction: 'backward'
  });
  }

  submitPassword() {
   
    if(this.password === this.confirmpassword && this.password && this.confirmpassword) {
      this.user.password = this.password;
      this.database.createJournalPassword(this.user).then(res => {
        console.log(res);
        this.isJournalPasswordSet = true;
        this.password = '';
        this.presentToast('Password set up successfully')
      })
    } else if(this.password !== this.confirmpassword) {
      this.presentToast('Password not match');
    } else {
      this.presentToast('Pleae fill up fields')
    }
  }

  presentToast(message) {
   const toast = this.toast.create({
     message: message,
     duration: 3000
   });
   toast.present();
  }

  verifiyPassword(){
    if(this.password === this.user.password) {
      this.isJournalPasswordSet = true;
      this.isLogin = true;
      this.navbarColor = 'light';
      this.backColor = this.database.color
      this.title = 'My Journal';
    } else {
      this.presentToast('Invalid Credential');
    }
  }
  changePassword(){
    const modal = this.modal.create(ChangePasswordPage, {user: this.user});
    modal.present();
    modal.onDidDismiss(hasChanges => {
    this.backColor = this.database.color;
     if(hasChanges) {
      this.isLogin = false;
     }
    })
  }
  gotoArchive(){
    const modal = this.modal.create(ArchiveJournalPage);
    modal.present();
    modal.onDidDismiss(isChanges => {
      if(isChanges) {
        this.initialize();
      }
    })
  }
  archive(journal: Journal){
    this.alert.create({
      title: "Archive",
      message: "Are you sure you want to put this journal on archive?",
      buttons: [
        {
          text: "Cancel"
        },
        {
          text: 'Ok',
          handler: ()=>{
            console.log(journal)
            this.doArchive(journal);
          }
        }
      ]
    }).present();
  }
  async doArchive(journal){
    // await this.database.deleteJournal(journal.doc._id,journal.doc._rev);
    await this.database.insertArchiveJournal(journal.doc);
    this.initialize();
    this.toast.create({
      duration: 2000,
      message: "Journal successfully put to archive"
    }).present();
  }
}   
