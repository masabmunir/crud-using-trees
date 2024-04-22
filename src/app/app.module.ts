import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { CdkDropList} from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@angular/material/menu';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TreeDetailsComponent } from './tree-details/tree-details.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import { EditNodeDialogeComponent } from './edit-node-dialoge/edit-node-dialoge.component';
import { FormsModule} from '@angular/forms';
import { AddItemComponent } from './add-item/add-item.component';
import { DeletItemComponent } from './delet-item/delet-item.component';
import { DropdownComponent, } from './dropdown/dropdown.component';
import { BasicTreeComponent,ChecklistDatabase } from './Components/basic-tree/basic-tree.component';
import { UpdateDialougeComponent } from './Components/update-dialouge/update-dialouge.component';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from 'src/service/user.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    TreeDetailsComponent,
    EditNodeDialogeComponent,
    AddItemComponent,
    DeletItemComponent,
    DropdownComponent,
    BasicTreeComponent,
    UpdateDialougeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTreeModule,
    MatIconModule,
    MatTreeModule,
    MatDialogModule,MatFormFieldModule,
    FormsModule,
    MatCheckboxModule,
    MatInputModule,MatButtonModule,
    MatSnackBarModule,
    MatSnackBarModule ,
    DragDropModule,
    MatCheckboxModule ,
    CdkDropList,
    MatSelectModule,
    MatMenuModule,
    HttpClientModule

  ],
  providers: [
    ChecklistDatabase,
    UserService
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
