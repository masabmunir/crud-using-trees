import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Injectable, Output } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { UpdateDialougeComponent } from '../update-dialouge/update-dialouge.component';
import { EditNodeDialogeComponent } from 'src/app/edit-node-dialoge/edit-node-dialoge.component';

export class TodoItemNode {
  children?: TodoItemNode[];
  item?: string;

}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item?: string;
  level?: number;
  expandable?: boolean;
}

const TREE_DATA = {
  Groceries: {
    'Almond Meal flour': null,
    'Organic eggs': null,
    'Protein Powder': null,

  },

};

@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize();
  }

  initialize() {

    const data = this.buildFileTree(TREE_DATA, 0);

    this.dataChange.next(data || []);
  }

  buildFileTree(obj: { [key: string]: any }, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  insertItem(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.push({ item: name } as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }
}

@Component({
  selector: 'app-basic-tree',
  templateUrl: './basic-tree.component.html',
  styleUrls: ['./basic-tree.component.css']
})
export class BasicTreeComponent {
  updatedname?: string
  parentNodes: TodoItemNode[] = [];
  childNode?: TodoItemNode[] = []
  fullparentNodes: TodoItemNode[] = [];
  selectedParentNode: TodoItemNode | null = null;
  gettingChild: TodoItemNode[] = [];
  childs: TodoItemNode[] = []
  newChildNode: TodoItemNode | undefined;
  childsarray: string[] | undefined[] = [];

  @Output() update = new EventEmitter<any>()
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  selectedParent: TodoItemFlatNode | null = null;

  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  constructor(private _database: ChecklistDatabase, private dialog: MatDialog) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren,

    );
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
    this._database.dataChange.subscribe(data => {
      this.parentNodes = data.filter(node => node.item);
    });
  }


  getLevel = (node: TodoItemFlatNode) => node.level ?? 0;

  isExpandable = (node: TodoItemFlatNode) => node.expandable ?? true;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children ?? [];

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.item === node.item ? existingNode : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length; // Set expandable based on whether the node has children
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };


  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every(child => {
        return this.checklistSelection.isSelected(child);
      });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every(child => {
        return this.checklistSelection.isSelected(child);
      });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
   
    const parentNode = this.flatNodeMap.get(node);
    const newItemName = prompt("Enter the name of the new item");
    if (newItemName !== null && newItemName !== "") {
      if (!parentNode?.children) {
        parentNode!.children = [];
        node.expandable = true
        if (node.level) {
          node.level += 1
        }
        console.log(this._database.dataChange.next([...this._database.data]));
      }
      const newChildNode = { item: newItemName, children: [] } as TodoItemNode;
      parentNode?.children.push(newChildNode);

      this._database.dataChange.next([...this._database.data]);
      console.log("Expanding parent node:", parentNode);

    }
  }

  /** Save the node to database */
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this._database.updateItem(nestedNode!, itemValue);
  }
  deleteItem(node: TodoItemFlatNode): void {
    // Get the nested node corresponding to the flat node
    const nestedNode = this.flatNodeMap.get(node);

    // Ensure the node exists
    if (!nestedNode) {
      return;
    }

    // Delete the node from the data source
    const parentNode = this.getParentNode(node);
    if (parentNode) {
      const parentNestedNode = this.flatNodeMap.get(parentNode);
      if (parentNestedNode && parentNestedNode.children) {
        parentNestedNode.children = parentNestedNode.children.filter(child => child !== nestedNode);
      }
    } else {
      // If there's no parent node, it means this is a root node
      const data = this.dataSource.data;
      const index = data.indexOf(nestedNode);
      if (index > -1) {
        data.splice(index, 1);
      }
    }

    // Notify changes
    this._database.dataChange.next([...this._database.data]);

    // Check the parent nodes' selection
    this.checkAllParentsSelection(node);
  }



  getAllDescendants(node: TodoItemNode, excludedNode: TodoItemNode | null): (string | undefined)[] {
    if (!node.children) {
      return [];
    }
    const childrenItems = node.children.map(child => child.item).filter((item): item is string => !!item && node !== excludedNode);
    const descendants = node.children.flatMap(child => this.getAllDescendants(child, excludedNode)).filter((item): item is string => !!item);
    return [...childrenItems, ...descendants];
  }
  openDialog(node: TodoItemFlatNode): void {

    const nestedNode = this.flatNodeMap.get(node);
 
    console.log(nestedNode?.item)
    const nesteddescendent = nestedNode?.children?.flatMap(child => [
      child.item,
      ...(child?.children?.flatMap(node => [
        node.item,
        ...(node?.children?.map(nodes => nodes.item) || [])
      ]) || [])  
    ]) || [];  


    const parentNodesItemValues = this.parentNodes.map(node => {
      // Skip the node if it's the same as nestedNode
      const childrenItems = node.children?.map(child => child.item).filter((item): item is string => !!item);
      const descendants = node.children?.flatMap(child => this.getAllDescendants(child, node)).filter((item): item is string => !!item);
      const filteredDescendants = descendants?.filter(descendant => !nesteddescendent.includes(descendant)); // Filter out descendants from nesteddescendent
      const filteredChildrenItems = childrenItems?.filter(childItem => !nesteddescendent.includes(childItem)); // Filter out children items from nesteddescendent
      return [node.item, ...(filteredChildrenItems || []), ...(filteredDescendants || [])];
    }).flat() as string[];




    const dialogRef = this.dialog.open(UpdateDialougeComponent, { data: { node: node, parentNodes: parentNodesItemValues } });

    dialogRef.componentInstance.update.subscribe((updatedName: string) => {
      this._database.updateItem(this.flatNodeMap.get(node)!, updatedName);
    });

    dialogRef.componentInstance.updateNode.subscribe((data: any) => {

      const parentNodeItem = data.parentNode;
      const childNodeItem = data.childNode;



      // Find the parent node in the tree data structure
      const parentNode = this.findNodeByItem(this.dataSource.data, parentNodeItem);
      const existingChildNode = this.findNodeByItem(this.dataSource.data, childNodeItem);





      if (parentNode && existingChildNode) {
        this.deleteChildNodeInTree(existingChildNode);
        // Create a new child node
        this.newChildNode = { item: childNodeItem, children: existingChildNode.children } as TodoItemNode;

        this.childsarray = this.newChildNode?.children?.flatMap(child => [
          child.item,
          ...(child.children?.map(node => node.item) || [])
        ]).filter(item => item !== undefined) as string[];
        console.log(this.childsarray)


        // Add the new child node to the parent node
        parentNode.children = parentNode.children || [];
        parentNode.children.push(this.newChildNode);
        console.log(parentNodesItemValues)

        // Notify changes in the data source
        this._database.dataChange.next([...this._database.data]);

        // Optionally, you can expand the parent node in the tree
        const flatParentNode = this.nestedNodeMap.get(parentNode);
        if (flatParentNode) {
          this.treeControl.expand(flatParentNode);
        }
      } else {
        console.log("Parent node or child node not found.");
      }
    });
  }

  findNodeByItem(nodes: TodoItemNode[], item: string): TodoItemNode | undefined {
    for (const node of nodes) {
      if (node.item === item) {
        return node;
      }
      if (node.children) {
        const foundNode = this.findNodeByItem(node.children, item);
        if (foundNode) {
          return foundNode;
        }
      }
    }
    return undefined;
  }
  deleteChildNodeInTree(childNode: TodoItemNode): void {
    // Find the parent node of the child node
    const parentNode = this.findParentNodeInTree(this.dataSource.data, childNode);

    // Ensure that the parent node is found
    if (parentNode) {
      // Delete the child node from the parent's children array
      parentNode.children = parentNode.children?.filter(child => child !== childNode);

      // Notify changes in the data source
      this._database.dataChange.next([...this._database.data]);
    }

  }

  findParentNodeInTree(nodes: TodoItemNode[], childNode: TodoItemNode): TodoItemNode | undefined {
    for (const node of nodes) {
      if (node.children && node.children.includes(childNode)) {
        return node;
      } else if (node.children) {
        const parentNode = this.findParentNodeInTree(node.children, childNode);
        if (parentNode) {
          return parentNode;
        }
      }
    }
    return undefined;
  }

  editItem(node: TodoItemFlatNode): void {
    const nestedNode = this.flatNodeMap.get(node);
    if (!nestedNode) {
      console.error('Nested node is undefined');
      return;
    }
  
    const dialogRef = this.dialog.open(EditNodeDialogeComponent, {
      width: '250px',
      data: { itemName: nestedNode.item } // Pass the current item name to the dialog
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result && result !== nestedNode.item) {
        this._database.updateItem(nestedNode!, result); // Update the item name in the database
      }
    });
  }
  
  hasChildren(node: TodoItemFlatNode): boolean {
    const nestedNode = this.flatNodeMap.get(node);
    return !!nestedNode && !!nestedNode.children && nestedNode.children.length > 0;
  }
 
}
