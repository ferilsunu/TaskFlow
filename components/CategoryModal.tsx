import React, { useState } from 'react';
import { X, Plus, Pencil, Trash2, Check, Folder, AlertCircle } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_CATEGORIES = 7;

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const { categories, addCategory, editCategory, deleteCategory } = useTasks();
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await addCategory(newCatName.trim());
      setNewCatName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (cat: string) => {
    setEditingCat(cat);
    setEditedName(cat);
  };

  const handleSaveEdit = async (oldName: string) => {
    if (!editedName.trim() || editedName.trim() === oldName) {
      setEditingCat(null);
      return;
    }
    try {
      setIsSubmitting(true);
      await editCategory(oldName, editedName.trim());
      setEditingCat(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: string) => {
    if (cat.toLowerCase() === 'inbox') return;
    try {
      setIsSubmitting(true);
      await deleteCategory(cat);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div 
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-5 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between pr-8">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              Manage Categories
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {categories.length}/{MAX_CATEGORIES}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Create and customize up to {MAX_CATEGORIES} categories for a clean, non-scrolling layout.
          </p>
        </div>

        {/* Add New Category Form (if under limit) */}
        {categories.length < MAX_CATEGORIES ? (
          <form onSubmit={handleAdd} className="flex items-center gap-2 mb-4">
            <input
              type="text"
              maxLength={25}
              enterKeyHint="done"
              placeholder="New category name..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 transition"
            />
            <button
              type="submit"
              disabled={!newCatName.trim() || isSubmitting}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1 hover:opacity-90 active:scale-95 transition disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-[11px] font-medium mb-4">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Maximum limit of {MAX_CATEGORIES} categories reached.</span>
          </div>
        )}

        {/* List of Existing Categories */}
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isDefault = cat.toLowerCase() === 'inbox';
            const isEditing = editingCat === cat;

            return (
              <div
                key={cat}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-xs"
              >
                {isEditing ? (
                  <div className="flex items-center gap-1.5 flex-1 mr-2">
                    <input
                      type="text"
                      maxLength={25}
                      autoFocus
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="flex-1 px-2 py-1 rounded-lg bg-white dark:bg-neutral-700 text-xs text-neutral-900 dark:text-white outline-none border border-neutral-300 dark:border-neutral-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(cat)}
                      className="p-1 rounded-lg bg-emerald-500 text-white"
                      title="Save"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCat(null)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                    <Folder className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {cat}
                    </span>
                    {isDefault && (
                      <span className="text-[10px] text-neutral-400 italic">
                        (Default)
                      </span>
                    )}
                  </div>
                )}

                {!isEditing && (
                  <div className="flex items-center gap-1">
                    {!isDefault && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                          title="Rename category"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
