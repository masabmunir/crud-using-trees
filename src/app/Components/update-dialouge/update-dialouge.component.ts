import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TodoItemFlatNode,TodoItemNode} from '../basic-tree/basic-tree.component';
// @Component({
//   selector: 'app-updatedialog',
//   standalone: true,
//   imports: [MaterialModule, FormsModule, MatSelectModule, CommonModule],
//   templateUrl: './updatedialog.component.html',
//   styleUrl: './updatedialog.component.css'
// })
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
      // this.filteredParentNodes = this.filterParentNodes(data.node, data.parentNodes);
      // console.log(data.parentNodes)
       
      this.filteredParentNodes = this.parentNodes.filter(node => node !== this.updatedname);
      console.log(this.filteredParentNodes)
   
      
      // this.parentNodes = this.filterParentNodes(data.updatedname,data.parentNode);
      // console.log(data.parentNodes)
      // console.log(this.updatedname)
     
     

  }
  updatedname?: string        
  selectedParentNode?: TodoItemNode;
  parentNodes: TodoItemNode[] = [];   
  filteredParentNodes: TodoItemNode[] = [];
          
  @Output() update = new EventEmitter<any>()  
  @Output() updateNode = new EventEmitter<any>()

  updateName(data: TodoItemFlatNode): void {
    this.data.item = this.updatedname
    // console.log(data)
    // console.log(data.node.item)
    
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

    // Function to traverse the tree and collect updated node and its descendants
    const collectUpdatedNodeAndDescendants = (node: TodoItemFlatNode) => {
      updatedNodeAndDescendants.push(node);
      // console.log(node.item)
      
      
      // if (node.children) {
      //   node.item.forEach(child => collectUpdatedNodeAndDescendants(child));
      // }
    };

    // Collect the updated node and its descendants
    collectUpdatedNodeAndDescendants(selectedNode);
    

    // Function to filter out nodes which are not descendants of the updated node
    const filterOutDescendants = (node: TodoItemNode): boolean => {
      for (const updatedNode of updatedNodeAndDescendants) {
        if (updatedNode === node || updatedNodeAndDescendants.includes(node)) {
          return false;
        }
      }
      return true;
    };

    // Filter out the nodes which are not descendants of the updated node
    if (Array.isArray(allNodes)) {
      parentNodes.push(...allNodes.filter(filterOutDescendants));
    }

    return parentNodes;
}
} 