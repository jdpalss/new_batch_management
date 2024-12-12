import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormGroup,
  Label,
  Row,
  Col,
  Alert
} from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { TemplateField, FieldOption } from '../../types/template';
import { generateFieldValue } from '../../utils/field';

interface FieldOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: TemplateField;
  onSave: (options: FieldOption[]) => void;
}

export const FieldOptionsModal: React.FC<FieldOptionsModalProps> = ({
  isOpen,
  onClose,
  field,
  onSave
}) => {
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [newOption, setNewOption] = useState({ label: '', value: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && field) {
      setOptions(field.options || []);
      setError(null);
      setNewOption({ label: '', value: '' });
    }
  }, [isOpen, field]);

  const validateOption = () => {
    if (!newOption.label.trim()) {
      setError('Label is required');
      return false;
    }

    if (!newOption.value.trim()) {
      setError('Value is required');
      return false;
    }

    if (options.some(opt => opt.value === newOption.value)) {
      setError('Option value must be unique');
      return false;
    }

    return true;
  };

  const handleAddOption = () => {
    setError(null);
    
    if (!validateOption()) {
      return;
    }

    setOptions([...options, newOption]);
    setNewOption({ label: '', value: '' });
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (options.length === 0) {
      setError(`${field.type} field must have at least one option`);
      return;
    }
    onSave(options);
  };

  const handleGenerateValue = () => {
    if (!newOption.label.trim()) {
      setError('Please enter a label first');
      return;
    }

    setNewOption(prev => ({
      ...prev,
      value: generateFieldValue(prev.label)
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(options);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOptions(items);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newOption.label && newOption.value) {
      e.preventDefault();
      handleAddOption();
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg">
      <ModalHeader toggle={onClose}>
        Edit Options for {field.label || 'Field'}
      </ModalHeader>
      <ModalBody>
        {error && (
          <Alert color="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Row className="mb-4">
          <Col>
            <FormGroup>
              <Label>New Option</Label>
              <div className="d-flex gap-2">
                <Input
                  placeholder="Label"
                  value={newOption.label}
                  onChange={e =>
                    setNewOption(prev => ({ ...prev, label: e.target.value }))
                  }
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
                <Input
                  placeholder="Value"
                  value={newOption.value}
                  onChange={e =>
                    setNewOption(prev => ({ ...prev, value: e.target.value }))
                  }
                  onKeyPress={handleKeyPress}
                />
                <Button color="secondary" outline onClick={handleGenerateValue}>
                  Generate Value
                </Button>
                <Button color="primary" onClick={handleAddOption}>
                  Add
                </Button>
              </div>
            </FormGroup>
          </Col>
        </Row>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="options">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="border rounded"
              >
                {options.map((option, index) => (
                  <Draggable 
                    key={option.value} 
                    draggableId={option.value} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-3 border-bottom d-flex align-items-center justify-content-between ${
                          snapshot.isDragging ? 'bg-light' : 'bg-white'
                        }`}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className="text-muted">#{index + 1}</span>
                          <div>
                            <div>{option.label}</div>
                            <code className="small text-muted">
                              {option.value}
                            </code>
                          </div>
                        </div>
                        <Button
                          color="danger"
                          outline
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {options.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    No options added yet
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave}>
          Save Options
        </Button>
      </ModalFooter>
    </Modal>
  );
};