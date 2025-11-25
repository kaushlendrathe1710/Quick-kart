import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, FileText } from 'lucide-react';

interface SpecificationInputProps {
  value?: string; // JSON string or empty
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
}

interface SpecificationField {
  key: string;
  value: string;
}

/**
 * SpecificationInput Component
 *
 * User-friendly component for adding product specifications as key-value pairs
 * Converts to JSON object format: {"brand":"BrewMaster","capacity":"12 cups"}
 *
 * @example
 * <SpecificationInput
 *   value={specifications}
 *   onChange={setSpecifications}
 * />
 */
export function SpecificationInput({
  value,
  onChange,
  disabled = false,
  label = 'Product Specifications',
}: SpecificationInputProps) {
  const [fields, setFields] = useState<SpecificationField[]>([]);

  // Parse JSON string to fields on mount or value change
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) {
          const fieldArray = Object.entries(parsed).map(([key, val]) => ({
            key,
            value: String(val),
          }));
          setFields(fieldArray.length > 0 ? fieldArray : [{ key: '', value: '' }]);
        } else {
          setFields([{ key: '', value: '' }]);
        }
      } catch {
        // If invalid JSON or empty, start with one empty field
        setFields([{ key: '', value: '' }]);
      }
    } else {
      setFields([{ key: '', value: '' }]);
    }
  }, [value]);

  // Convert fields to JSON string and notify parent
  const updateParent = (updatedFields: SpecificationField[]) => {
    // Filter out empty fields
    const validFields = updatedFields.filter((field) => field.key.trim() !== '');

    if (validFields.length === 0) {
      onChange('');
      return;
    }

    // Convert to JSON object
    const specObj = validFields.reduce(
      (acc, field) => {
        acc[field.key.trim()] = field.value.trim();
        return acc;
      },
      {} as Record<string, string>
    );

    onChange(JSON.stringify(specObj));
  };

  const handleAddField = () => {
    const newFields = [...fields, { key: '', value: '' }];
    setFields(newFields);
  };

  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    // Ensure at least one field remains
    const updatedFields = newFields.length === 0 ? [{ key: '', value: '' }] : newFields;
    setFields(updatedFields);
    updateParent(updatedFields);
  };

  const handleKeyChange = (index: number, newKey: string) => {
    const newFields = [...fields];
    newFields[index].key = newKey;
    setFields(newFields);
    updateParent(newFields);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const newFields = [...fields];
    newFields[index].value = newValue;
    setFields(newFields);
    updateParent(newFields);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-base font-medium">
          <FileText className="h-4 w-4" />
          {label}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddField}
          disabled={disabled}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Add product specifications like brand, material, size, color, capacity, etc.
      </p>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <Card key={index} className="p-3">
            <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-[1fr_1fr_auto]">
              <div className="space-y-1.5">
                <Label htmlFor={`spec-key-${index}`} className="text-xs text-muted-foreground">
                  Property Name
                </Label>
                <Input
                  id={`spec-key-${index}`}
                  placeholder="e.g., Brand, Material, Size"
                  value={field.key}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  disabled={disabled}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`spec-value-${index}`} className="text-xs text-muted-foreground">
                  Value
                </Label>
                <Input
                  id={`spec-value-${index}`}
                  placeholder="e.g., Nike, Cotton, Large"
                  value={field.value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  disabled={disabled}
                  className="h-9"
                />
              </div>

              <div className="flex h-full items-end pb-1 md:pb-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveField(index)}
                  disabled={disabled || fields.length === 1}
                  className="h-9 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {fields.filter((f) => f.key.trim() !== '').length === 0 && (
        <p className="text-xs italic text-muted-foreground">
          No specifications added yet. Click "Add Field" to start.
        </p>
      )}
    </div>
  );
}
