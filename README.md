# Sage Front-End Engineer Technical Assessment

## Task 1 — Widget state recycling in a buffered grid

### Problem

The original implementation stores a row specific state outside the widget's current record association.

Because widgets are recycled by the buffered grid, the deferred callback can run after a widget has already been attached to a different record. In addition, `col._lastRecord` is shared by the whole column, so the button handler can act on the wrong row.

### Solution

The widget state is now updated synchronously in `onWidgetAttach`, using the record currently attached to the widget.

The button handler retrieves its current record through `getWidgetRecord()` and updates that record through the model API.

Both the button text and disabled state are reassigned whenever the widget is attached to a record, preventing state from leaking between recycled rows.

### References

- [Ext.grid.column.Widget — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.grid.column.Widget.html)
  - `onWidgetAttach`
  - `getWidgetRecord()`

- [Ext.button.Button — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.button.Button.html)
  - `setText()`
  - `setDisabled()`

- [Ext.data.Model — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.data.Model.html)
  - `get()`
  - `set()`