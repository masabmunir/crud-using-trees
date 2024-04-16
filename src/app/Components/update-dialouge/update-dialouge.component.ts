import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TodoItemFlatNode,TodoItemNode} from '../basic-tree/basic-tree.component';

@Component({
  selector: 'app-update-dialouge',
  templateUrl: './update-dialouge.component.html',
  styleUrls: ['./update-dialouge.component.css']
})
export class UpdateDialougeComponent {
  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any){
      this.updatedname = data.node.item
      this.parentNodes = data.parentNodes;

      this.filteredParentNodes = this.parentNodes.filter(node => node !== this.updatedname);
      console.log(this.filteredParentNodes,"=========")
   
  }
  updatedname?: string        
  selectedParentNode?: TodoItemNode;
  parentNodes: TodoItemNode[] = [];   
  filteredParentNodes: TodoItemNode[] = [];
          
  @Output() update = new EventEmitter<any>()  
  @Output() updateNode = new EventEmitter<any>()

  updateName(data: TodoItemFlatNode): void {
    this.data.item = this.updatedname
    
    const newdata = {
      childNode: data.item,
      parentNode: this.selectedParentNode
    }         
 
    this.updateNode.emit(newdata)
    this.dialogRef.close();
    
    
  }
  cancelUpdate(){
    this.dialogRef.close();

  }
  filterParentNodes(selectedNode: TodoItemNode, allNodes: TodoItemNode[]): TodoItemNode[] {
    const parentNodes: TodoItemNode[] = [];
    const updatedNodeAndDescendants: TodoItemNode[] = [];

    const collectUpdatedNodeAndDescendants = (node: TodoItemFlatNode) => {
      updatedNodeAndDescendants.push(node);
    
    };

    collectUpdatedNodeAndDescendants(selectedNode);
    

    const filterOutDescendants = (node: TodoItemNode): boolean => {
      for (const updatedNode of updatedNodeAndDescendants) {
        if (updatedNode === node || updatedNodeAndDescendants.includes(node)) {
          return false;
        }
      }
      return true;
    };
    if (Array.isArray(allNodes)) {
      parentNodes.push(...allNodes.filter(filterOutDescendants));
    }

    return parentNodes;
}
} 