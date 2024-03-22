import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-delet-item',
  templateUrl: './delet-item.component.html',
  styleUrls: ['./delet-item.component.css']
})
export class DeletItemComponent {

  constructor(
    public dialogRef: MatDialogRef<DeletItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { itemName: string, hasChildren: boolean }
  ) { }

}
