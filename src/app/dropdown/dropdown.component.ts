import { Component, Injectable, Output, EventEmitter } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';

/**
 * Node for to-do item
 */
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

/**
 * The Json object for to-do list data.
 */
const TREE_DATA = {
  Groceries: {
    'Almond Meal flour': null,
    'Organic eggs': null,
    'Protein Powder': null,
    Fruits: {
      Apple: null,
      Berries: ['Blueberry', 'Raspberry'],
      Orange: null,
    },
  },
  Reminders: ['Cook dinner', 'Read the Material Design spec', 'Upgrade Application to Angular'],
  Vegetables: {
    'green': ['loki', 'cocumber'],
    'red': ['Carrot', 'Tomato']
  },
  Dishes: {
    'Biryani': ['Spicy', 'Simple'],
    Korma: null
  },
};

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
  dataChange = new EventEmitter<TodoItemNode[]>();

  get data(): TodoItemNode[] {
    return this._data;
  }
  private _data: TodoItemNode[] = [];

  constructor() {
    this.initialize();
  }

  initialize() {
    // Build the tree nodes from Json object. The result is a list of TodoItemNode with nested
    // file node as children.
    const data = this.buildFileTree(TREE_DATA, 0);

    // Notify the change.
    this.dataChange.emit(data || []);
  }

  /**
   * Build the file structure tree. The value is the Json object, or a sub-tree of a Json object.
   * The return value is the list of TodoItemNode.
   */
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

  /** Update an item's name */
  updateItem(node: TodoItemNode, newName: string): void {
    if (node) {
      node.item = newName;
      this.dataChange.emit(this._data);
    }
  }
}

/**
 * @title Tree with checkboxes
 */
@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent {

  updatedname?: string
  parentNodes: TodoItemNode[] = [];

  @Output() update = new EventEmitter<any>();
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();
  treeControl: FlatTreeControl<TodoItemFlatNode>;
  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;
  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  constructor(private _database: ChecklistDatabase) {
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
      this.parentNodes = data.filter(node => node.item);
    });
  }

  getLevel = (node: TodoItemFlatNode) => node.level ?? 0;
  isExpandable = (node: TodoItemFlatNode) => node.expandable ?? true;
  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children ?? [];
  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;
  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  transformer = (node: TodoItemNode, level: number): TodoItemFlatNode => {
    const existingNode = this.nestedNodeMap.get(node);
    if (existingNode) {
      const flatNode = new TodoItemFlatNode();
      flatNode.item = node.item;
      flatNode.level = level;
      flatNode.expandable = !!node.children?.length;
      this.flatNodeMap.set(flatNode, node);
      this.nestedNodeMap.set(node, flatNode);
      return flatNode;
    } else {
      throw new Error('Existing node is undefined');
    }
};


  
    descendantsAllSelected(node: TodoItemFlatNode): boolean {
      const descendants = this.treeControl.getDescendants(node);
      const descAllSelected =
        descendants.length > 0 &&
        descendants.every(child => {
          return this.checklistSelection.isSelected(child);
        });
      return descAllSelected;
    }
  
    descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
      const descendants = this.treeControl.getDescendants(node);
      const result = descendants.some(child => this.checklistSelection.isSelected(child));
      return result && !this.descendantsAllSelected(node);
    }
  
    todoItemSelectionToggle(node: TodoItemFlatNode): void {
      this.checklistSelection.toggle(node);
      const descendants = this.treeControl.getDescendants(node);
      this.checklistSelection.isSelected(node)
        ? this.checklistSelection.select(...descendants)
        : this.checklistSelection.deselect(...descendants);
      descendants.forEach(child => this.checklistSelection.isSelected(child));
      this.checkAllParentsSelection(node);
    }
  
    todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
      this.checklistSelection.toggle(node);
      this.checkAllParentsSelection(node);
    }
  
    checkAllParentsSelection(node: TodoItemFlatNode): void {
      let parent: TodoItemFlatNode | null = this.getParentNode(node);
      while (parent) {
        this.checkRootNodeSelection(parent);
        parent = this.getParentNode(parent);
      }
    }
  
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
  
    addNewItem(node: TodoItemFlatNode) {
      const parentNode = this.flatNodeMap.get(node);
      const newItemName = prompt("Enter the name of the new item");
      if (newItemName !== null && newItemName !== "") {
        if (!parentNode?.children) {
          parentNode!.children = [];
        }
        const newChildNode = { item: newItemName, children: [] } as TodoItemNode;
        parentNode?.children.push(newChildNode);
        this._database.dataChange.next([...this._database.data]);
        this.treeControl.expand(node);
      }
    }
  
    saveNode(node: TodoItemFlatNode, itemValue: string): void {
      const nestedNode = this.flatNodeMap.get(node);
      const newName = itemValue || ''; // Ensure newName is a string
      this._database.updateItem(nestedNode!, newName);
    }
    
    deleteItem(node: TodoItemFlatNode): void {
      const nestedNode = this.flatNodeMap.get(node);
  
      if (!nestedNode) {
        return;
      }
  
      const parentNode = this.getParentNode(node);
      if (parentNode) {
        const parentNestedNode = this.flatNodeMap.get(parentNode);
        if (parentNestedNode && parentNestedNode.children) {
          parentNestedNode.children = parentNestedNode.children.filter(child => child !== nestedNode);
        }
      } else {
        const data = this.dataSource.data;
        const index = data.indexOf(nestedNode);
        if (index > -1) {
          data.splice(index, 1);
        }
      }
  
      this._database.dataChange.next([...this._database.data]);
      this.checkAllParentsSelection(node);
    }
  }
  