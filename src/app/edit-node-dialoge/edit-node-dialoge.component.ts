import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-node-dialoge',
  templateUrl: './edit-node-dialoge.component.html',
  styleUrls: ['./edit-node-dialoge.component.css']
})
export class EditNodeDialogeComponent {
  constructor(
    public dialogRef: MatDialogRef<EditNodeDialogeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
