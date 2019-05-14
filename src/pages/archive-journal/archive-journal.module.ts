import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ArchiveJournalPage } from './archive-journal';

@NgModule({
  declarations: [
    ArchiveJournalPage,
  ],
  imports: [
    IonicPageModule.forChild(ArchiveJournalPage),
  ],
})
export class ArchiveJournalPageModule {}
