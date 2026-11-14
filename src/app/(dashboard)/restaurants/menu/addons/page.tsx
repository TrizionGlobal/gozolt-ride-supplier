'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Utensils,
  Layers,
  ArrowRight,
  FolderPlus,
  ShieldAlert,
  ChevronDown,
  Info,
  Check,
  X,
  AlertCircle,
  Eye,
  GripVertical,
  DollarSign,
  Tag,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface AddonOption {
  id: string;
  name: string;
  price: number; // Additional price in EUR e.g. 1.50
  isAvailable: boolean;
  displayOrder: number;
}

export interface AddonGroup {
  id: string;
  name: string; // e.g. "Extra Cheese", "Pizza Toppings", "Sauces", "Drink Add-ons", "Burger Extras"
  description: string;
  selectionType: 'SINGLE' | 'MULTIPLE';
  minSelection: number;
  maxSelection: number;
  isRequired: boolean;
  associatedItemIds: string[];
  associatedItemNames: string[];
  options: AddonOption[];
  status: 'ACTIVE' | 'INACTIVE';
}

const AVAILABLE_FOOD_ITEMS = [
  { id: 'dish-1', name: 'Truffle Mushroom Tagliolini', category: 'Pasta' },
  { id: 'dish-2', name: 'Woodfired Pizza Diavola', category: 'Pizza' },
  { id: 'dish-3', name: 'Pizza Margherita D.O.P.', category: 'Pizza' },
  { id: 'dish-4', name: 'The Gozolt Prime Angus Smashed Burger', category: 'Burgers' },
  { id: 'dish-5', name: 'Burrata Pugliese & Prosciutto San Daniele', category: 'Starters' },
  { id: 'dish-6', name: 'Homemade Tiramisu al Mascarpone', category: 'Desserts' },
  { id: 'dish-7', name: 'Artisan Sicilian Cannoli', category: 'Desserts' },
  { id: 'dish-8', name: 'San Pellegrino Sparkling Blood Orange', category: 'Beverages' },
  { id: 'dish-9', name: 'Italian Aperol Spritz 0.0%', category: 'Beverages' },
  { id: 'dish-10', name: 'Caesar Salad with Crispy Pancetta', category: 'Salads' },
  { id: 'dish-11', name: 'Pollo alla Parmigiana Classic', category: 'Main Course' },
  { id: 'dish-12', name: 'Truffle Fries with Pecorino & Garlic Aioli', category: 'Starters' },
];

export default function RestaurantAddonsPage() {
  // Pre-populated examples requested in specifications:
  // Extra Cheese, Pizza Toppings, Sauces, Drink Add-ons, Burger Extras
  const [groups, setGroups] = useState<AddonGroup[]>([
    {
      id: 'grp-1',
      name: 'Extra Cheese',
      description: 'Gourmet Italian and aged artisan cheeses melted on top',
      selectionType: 'MULTIPLE',
      minSelection: 0,
      maxSelection: 3,
      isRequired: false,
      associatedItemIds: ['dish-2', 'dish-3', 'dish-4'],
      associatedItemNames: ['Woodfired Pizza Diavola', 'Pizza Margherita D.O.P.', 'The Gozolt Prime Angus Smashed Burger'],
      status: 'ACTIVE',
      options: [
        { id: 'opt-1', name: 'Cheddar', price: 1.5, isAvailable: true, displayOrder: 1 },
        { id: 'opt-2', name: 'Mozzarella', price: 2.0, isAvailable: true, displayOrder: 2 },
        { id: 'opt-3', name: 'Parmesan', price: 1.8, isAvailable: true, displayOrder: 3 },
        { id: 'opt-4', name: 'Gorgonzola Dolce D.O.P.', price: 2.2, isAvailable: true, displayOrder: 4 },
      ],
    },
    {
      id: 'grp-2',
      name: 'Pizza Toppings',
      description: 'Fresh imported meats, wood-roasted vegetables, and Italian herbs',
      selectionType: 'MULTIPLE',
      minSelection: 0,
      maxSelection: 5,
      isRequired: false,
      associatedItemIds: ['dish-2', 'dish-3'],
      associatedItemNames: ['Woodfired Pizza Diavola', 'Pizza Margherita D.O.P.'],
      status: 'ACTIVE',
      options: [
        { id: 'opt-5', name: 'Spicy Calabrian Spianata Salami', price: 2.5, isAvailable: true, displayOrder: 1 },
        { id: 'opt-6', name: 'Wild Porcini Mushrooms', price: 2.8, isAvailable: true, displayOrder: 2 },
        { id: 'opt-7', name: 'Fresh Buffalo Mozzarella', price: 3.0, isAvailable: true, displayOrder: 3 },
        { id: 'opt-8', name: 'Kalamata Black Olives', price: 1.2, isAvailable: true, displayOrder: 4 },
        { id: 'opt-9', name: 'Fresh Baby Arugula & Shaved Grana', price: 1.5, isAvailable: true, displayOrder: 5 },
      ],
    },
    {
      id: 'grp-3',
      name: 'Sauces',
      description: 'Chef special house dips, dressings, and emulsified infused oils',
      selectionType: 'SINGLE',
      minSelection: 1,
      maxSelection: 1,
      isRequired: true,
      associatedItemIds: ['dish-4', 'dish-11', 'dish-12'],
      associatedItemNames: ['The Gozolt Prime Angus Smashed Burger', 'Pollo alla Parmigiana Classic', 'Truffle Fries with Pecorino & Garlic Aioli'],
      status: 'ACTIVE',
      options: [
        { id: 'opt-10', name: 'Black Truffle Garlic Aioli', price: 1.2, isAvailable: true, displayOrder: 1 },
        { id: 'opt-11', name: 'Spicy Calabrian Chili Mayo', price: 0.8, isAvailable: true, displayOrder: 2 },
        { id: 'opt-12', name: 'Sweet Smokey BBQ Dip', price: 0.8, isAvailable: true, displayOrder: 3 },
        { id: 'opt-13', name: 'Creamy Gorgonzola Dip', price: 1.5, isAvailable: true, displayOrder: 4 },
      ],
    },
    {
      id: 'grp-4',
      name: 'Drink Add-ons',
      description: 'Ice levels, citrus garnishes, and sweet botanical syrups',
      selectionType: 'MULTIPLE',
      minSelection: 0,
      maxSelection: 2,
      isRequired: false,
      associatedItemIds: ['dish-8', 'dish-9'],
      associatedItemNames: ['San Pellegrino Sparkling Blood Orange', 'Italian Aperol Spritz 0.0%'],
      status: 'ACTIVE',
      options: [
        { id: 'opt-14', name: 'Extra Crushed Ice', price: 0.0, isAvailable: true, displayOrder: 1 },
        { id: 'opt-15', name: 'Fresh Sicilian Lemon Wedge', price: 0.4, isAvailable: true, displayOrder: 2 },
        { id: 'opt-16', name: 'Fresh Mint Sprig', price: 0.5, isAvailable: true, displayOrder: 3 },
        { id: 'opt-17', name: 'Blood Orange Syrup Shot', price: 0.8, isAvailable: true, displayOrder: 4 },
      ],
    },
    {
      id: 'grp-5',
      name: 'Burger Extras',
      description: 'Gourmet patties, caramelized toppings, and cured pancetta bacon',
      selectionType: 'MULTIPLE',
      minSelection: 0,
      maxSelection: 4,
      isRequired: false,
      associatedItemIds: ['dish-4'],
      associatedItemNames: ['The Gozolt Prime Angus Smashed Burger'],
      status: 'ACTIVE',
      options: [
        { id: 'opt-18', name: 'Extra Black Angus Smashed Patty (150g)', price: 4.5, isAvailable: true, displayOrder: 1 },
        { id: 'opt-19', name: 'Crispy Smoked Pancetta Bacon', price: 2.0, isAvailable: true, displayOrder: 2 },
        { id: 'opt-20', name: 'Caramelized Balsamic Onions', price: 1.5, isAvailable: true, displayOrder: 3 },
        { id: 'opt-21', name: 'Fried Farm Free-Range Egg', price: 1.8, isAvailable: true, displayOrder: 4 },
        { id: 'opt-22', name: 'Pickled Jalapeño Slices', price: 1.0, isAvailable: true, displayOrder: 5 },
      ],
    },
  ]);

  // Screen 15: Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectionTypeFilter, setSelectionTypeFilter] = useState<'ALL' | 'SINGLE' | 'MULTIPLE'>('ALL');
  const [requirementFilter, setRequirementFilter] = useState<'ALL' | 'REQUIRED' | 'OPTIONAL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Screen 16: Add/Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // Screen 16 Form Fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSelectionType, setFormSelectionType] = useState<'SINGLE' | 'MULTIPLE'>('MULTIPLE');
  const [formIsRequired, setFormIsRequired] = useState(false);
  const [formMinSelection, setFormMinSelection] = useState(0);
  const [formMaxSelection, setFormMaxSelection] = useState(3);
  const [formAssociatedItemIds, setFormAssociatedItemIds] = useState<string[]>([]);
  const [formOptions, setFormOptions] = useState<AddonOption[]>([]);

  // Inline temporary state for adding an option to the list
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState('');

  // Inspection Drawer State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<AddonGroup | null>(null);

  // Delete Confirmation State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<AddonGroup | null>(null);

  // Filtered Groups for Screen 15
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchSearch =
        !searchTerm ||
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.options.some((o) => o.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = selectionTypeFilter === 'ALL' || g.selectionType === selectionTypeFilter;
      const matchReq =
        requirementFilter === 'ALL' ||
        (requirementFilter === 'REQUIRED' && g.isRequired) ||
        (requirementFilter === 'OPTIONAL' && !g.isRequired);
      const matchStatus = statusFilter === 'ALL' || g.status === statusFilter;

      return matchSearch && matchType && matchReq && matchStatus;
    });
  }, [groups, searchTerm, selectionTypeFilter, requirementFilter, statusFilter]);

  // Open Screen 16 in ADD Mode
  const handleOpenAdd = () => {
    setFormMode('ADD');
    setEditingGroupId(null);
    setFormName('');
    setFormDescription('');
    setFormSelectionType('MULTIPLE');
    setFormIsRequired(false);
    setFormMinSelection(0);
    setFormMaxSelection(3);
    setFormAssociatedItemIds(['dish-2', 'dish-3']);
    setFormOptions([
      { id: `opt-${Date.now()}-1`, name: 'Cheddar', price: 1.5, isAvailable: true, displayOrder: 1 },
      { id: `opt-${Date.now()}-2`, name: 'Mozzarella', price: 2.0, isAvailable: true, displayOrder: 2 },
      { id: `opt-${Date.now()}-3`, name: 'Parmesan', price: 1.8, isAvailable: true, displayOrder: 3 },
    ]);
    setNewOptionName('');
    setNewOptionPrice('');
    setIsFormOpen(true);
  };

  // Open Screen 16 in EDIT Mode
  const handleOpenEdit = (group: AddonGroup) => {
    setFormMode('EDIT');
    setEditingGroupId(group.id);
    setFormName(group.name);
    setFormDescription(group.description);
    setFormSelectionType(group.selectionType);
    setFormIsRequired(group.isRequired);
    setFormMinSelection(group.minSelection);
    setFormMaxSelection(group.maxSelection);
    setFormAssociatedItemIds([...group.associatedItemIds]);
    setFormOptions(group.options.map((o) => ({ ...o })));
    setNewOptionName('');
    setNewOptionPrice('');
    setIsFormOpen(true);
  };

  // Handle Selection Type Change with auto rule adjustments
  const handleSelectionTypeChange = (type: 'SINGLE' | 'MULTIPLE') => {
    setFormSelectionType(type);
    if (type === 'SINGLE') {
      setFormMaxSelection(1);
      setFormMinSelection(formIsRequired ? 1 : 0);
    } else {
      if (formMaxSelection === 1) {
        setFormMaxSelection(Math.max(formOptions.length, 3));
      }
    }
  };

  // Handle Required/Optional Toggle with auto rule adjustments
  const handleRequiredToggle = (required: boolean) => {
    setFormIsRequired(required);
    if (required) {
      if (formMinSelection < 1) setFormMinSelection(1);
    } else {
      setFormMinSelection(0);
    }
  };

  // Add Option to Form List
  const handleAddOptionToForm = () => {
    if (!newOptionName.trim()) {
      toast.error('Option name is required');
      return;
    }
    const priceNum = parseFloat(newOptionPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Please enter a valid price (e.g. 1.50 or 0.00)');
      return;
    }

    const newOpt: AddonOption = {
      id: `opt-${Date.now()}`,
      name: newOptionName.trim(),
      price: priceNum,
      isAvailable: true,
      displayOrder: formOptions.length + 1,
    };

    setFormOptions((prev) => [...prev, newOpt]);
    setNewOptionName('');
    setNewOptionPrice('');
  };

  // Remove Option from Form List
  const handleRemoveOptionFromForm = (optId: string) => {
    setFormOptions((prev) => prev.filter((o) => o.id !== optId));
  };

  // Toggle Option Availability inside form
  const handleToggleOptionAvail = (optId: string) => {
    setFormOptions((prev) =>
      prev.map((o) => (o.id === optId ? { ...o, isAvailable: !o.isAvailable } : o))
    );
  };

  // Toggle Associated Food Item
  const handleToggleAssociatedItem = (itemId: string) => {
    setFormAssociatedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // Select / Deselect All Food Items
  const handleSelectAllItems = () => {
    if (formAssociatedItemIds.length === AVAILABLE_FOOD_ITEMS.length) {
      setFormAssociatedItemIds([]);
    } else {
      setFormAssociatedItemIds(AVAILABLE_FOOD_ITEMS.map((i) => i.id));
    }
  };

  // Screen 16 Validation and Save
  const handleSaveGroup = () => {
    // 1. Group Name Validation
    if (!formName.trim()) {
      toast.error('Group Name is required', {
        description: 'Please enter a descriptive group name, e.g. "Extra Cheese".',
      });
      return;
    }

    // 2. Options validation
    if (formOptions.length === 0) {
      toast.error('At least one option is required', {
        description: 'Please add at least one add-on option with its price.',
      });
      return;
    }

    // 3. Selection Rules Validation
    const min = Number(formMinSelection);
    const max = Number(formMaxSelection);

    if (isNaN(min) || min < 0) {
      toast.error('Invalid Minimum Selection', {
        description: 'Minimum selection cannot be negative.',
      });
      return;
    }

    if (isNaN(max) || max < 1) {
      toast.error('Invalid Maximum Selection', {
        description: 'Maximum selection must be at least 1.',
      });
      return;
    }

    if (min > max) {
      toast.error('Validation Rule Error', {
        description: `Minimum selection (${min}) cannot exceed Maximum selection (${max}).`,
      });
      return;
    }

    if (formSelectionType === 'SINGLE') {
      if (max !== 1) {
        toast.error('Validation Rule Error', {
          description: 'Single selection groups must have Maximum Selection set to 1.',
        });
        return;
      }
      if (min > 1) {
        toast.error('Validation Rule Error', {
          description: 'Single selection groups cannot require more than 1 choice.',
        });
        return;
      }
    }

    if (formIsRequired && min < 1) {
      toast.error('Validation Rule Error', {
        description: 'Required add-on groups must have Minimum Selection of at least 1.',
      });
      return;
    }

    if (!formIsRequired && min > 0) {
      toast.error('Validation Rule Error', {
        description: 'Optional add-on groups must have Minimum Selection set to 0.',
      });
      return;
    }

    // Derive associated item names
    const associatedNames = AVAILABLE_FOOD_ITEMS.filter((i) =>
      formAssociatedItemIds.includes(i.id)
    ).map((i) => i.name);

    if (formMode === 'ADD') {
      const newGroup: AddonGroup = {
        id: `grp-${Date.now()}`,
        name: formName.trim(),
        description: formDescription.trim(),
        selectionType: formSelectionType,
        minSelection: min,
        maxSelection: max,
        isRequired: formIsRequired,
        associatedItemIds: formAssociatedItemIds,
        associatedItemNames: associatedNames,
        options: formOptions,
        status: 'ACTIVE',
      };

      setGroups((prev) => [newGroup, ...prev]);
      toast.success('Add-on Group Created', {
        description: `"${newGroup.name}" created with ${newGroup.options.length} options.`,
      });
    } else if (editingGroupId) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editingGroupId
            ? {
                ...g,
                name: formName.trim(),
                description: formDescription.trim(),
                selectionType: formSelectionType,
                minSelection: min,
                maxSelection: max,
                isRequired: formIsRequired,
                associatedItemIds: formAssociatedItemIds,
                associatedItemNames: associatedNames,
                options: formOptions,
              }
            : g
        )
      );
      toast.success('Add-on Group Updated', {
        description: `Changes to "${formName}" have been saved.`,
      });
    }

    setIsFormOpen(false);
  };

  // Toggle Group Status (Active / Inactive)
  const handleToggleStatus = (group: AddonGroup, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextStatus = group.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setGroups((prev) =>
      prev.map((g) => (g.id === group.id ? { ...g, status: nextStatus } : g))
    );
    toast.info(`Group status updated to ${nextStatus}`, {
      description: `"${group.name}" is now ${nextStatus}.`,
    });
  };

  // Duplicate Group
  const handleDuplicate = (group: AddonGroup, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const cloned: AddonGroup = {
      ...group,
      id: `grp-${Date.now()}`,
      name: `${group.name} (Copy)`,
      status: 'INACTIVE',
    };
    setGroups((prev) => [cloned, ...prev]);
    toast.success('Group Duplicated', {
      description: `Cloned "${group.name}".`,
    });
  };

  // Delete Group Confirmation
  const handleOpenDelete = (group: AddonGroup, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingGroup(group);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingGroup) return;
    setGroups((prev) => prev.filter((g) => g.id !== deletingGroup.id));
    toast.success('Add-on Group Deleted', {
      description: `"${deletingGroup.name}" removed from menu customization.`,
    });
    setIsDeleteOpen(false);
    setDeletingGroup(null);
  };

  // Details Modal
  const handleOpenDetails = (group: AddonGroup) => {
    setSelectedGroup(group);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 15: ADD-ON GROUP LISTING HEADER
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-3">
            <Sliders className="h-7 w-7 text-[#FCD223]" />
            Add-ons &amp; Customization
          </h1>
          <p className="mt-0.5 text-xs text-[#A1A1AA]">
            Configure modifier groups, mandatory or optional selection constraints, price deltas, and associated dishes
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleOpenAdd}
            className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Add-on Group
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 15: SEARCH & FILTER STRIP
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search group name, option..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#FCD223] focus:outline-none"
            />
          </div>

          {/* Selection Type Filter */}
          <div>
            <select
              value={selectionTypeFilter}
              onChange={(e) => setSelectionTypeFilter(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-zinc-200 focus:border-[#FCD223] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Selection Types</option>
              <option value="SINGLE">Single Choice (Radio)</option>
              <option value="MULTIPLE">Multiple Choice (Checkboxes)</option>
            </select>
          </div>

          {/* Requirement Filter */}
          <div>
            <select
              value={requirementFilter}
              onChange={(e) => setRequirementFilter(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-zinc-200 focus:border-[#FCD223] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Requirement Levels</option>
              <option value="REQUIRED">Required (Mandatory)</option>
              <option value="OPTIONAL">Optional</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-zinc-200 focus:border-[#FCD223] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses ({groups.length})</option>
              <option value="ACTIVE">Active Groups Only</option>
              <option value="INACTIVE">Inactive Groups Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 15: ADD-ON GROUP LISTING TABLE
          Columns: Group Name, Selection Type, Minimum Selection, Maximum Selection,
                   Number of Options, Status, Actions
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4">Group Name</th>
                <th className="py-3 px-4">Selection Type</th>
                <th className="py-3 px-4 text-center">Minimum Selection</th>
                <th className="py-3 px-4 text-center">Maximum Selection</th>
                <th className="py-3 px-4 text-center">Number of Options</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <Sliders className="h-8 w-8 mx-auto mb-2 opacity-30 text-[#FCD223]" />
                    <p className="font-semibold text-white">No add-on groups found</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Adjust your filter criteria or click "Add Add-on Group" to create one.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => (
                  <tr
                    key={group.id}
                    onClick={() => handleOpenDetails(group)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    {/* 1. Group Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg border border-white/10 bg-[#18181B] p-2 text-[#FCD223] group-hover:border-[#FCD223]/50 transition-colors">
                          <Sliders className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs group-hover:text-[#FCD223] transition-colors">
                              {group.name}
                            </span>
                            {group.isRequired ? (
                              <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-bold px-1.5 py-0">
                                Required
                              </Badge>
                            ) : (
                              <Badge className="border-white/10 bg-white/5 text-zinc-400 text-[10px] font-semibold px-1.5 py-0">
                                Optional
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                            {group.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                            <Utensils className="h-2.5 w-2.5 text-[#FCD223]" />
                            <span>Linked to {group.associatedItemIds.length} food dishes</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Selection Type */}
                    <td className="py-3.5 px-4">
                      {group.selectionType === 'SINGLE' ? (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-sky-400 font-semibold text-[11px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                          Single (Radio)
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-purple-400 font-semibold text-[11px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                          Multiple (Checkboxes)
                        </div>
                      )}
                    </td>

                    {/* 3. Minimum Selection */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-white text-xs bg-white/5 rounded-md px-2.5 py-1 border border-white/10">
                        {group.minSelection}
                      </span>
                    </td>

                    {/* 4. Maximum Selection */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-[#FCD223] text-xs bg-[#FCD223]/10 rounded-md px-2.5 py-1 border border-[#FCD223]/20">
                        {group.maxSelection}
                      </span>
                    </td>

                    {/* 5. Number of Options */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-white text-xs">
                          {group.options.length} options
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {group.options.filter((o) => o.isAvailable).length} available
                        </span>
                      </div>
                    </td>

                    {/* 6. Status */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleToggleStatus(group, e)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer',
                          group.status === 'ACTIVE'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        )}
                        title="Click to toggle status"
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            group.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-zinc-500'
                          )}
                        />
                        {group.status}
                      </button>
                    </td>

                    {/* 7. Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetails(group)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                          title="View Options"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(group)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-[#FCD223] transition-colors"
                          title="Edit Group"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDuplicate(group, e)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-sky-400 transition-colors"
                          title="Duplicate Group"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleOpenDelete(group, e)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Delete Group"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 16: ADD / EDIT ADD-ON GROUP MODAL
          Fields: Group Name, Description, Selection Type, Minimum Selection,
                  Maximum Selection, Required/Optional, Associated Food Items,
                  Add-on options (Name, Additional Price, Availability, Order).
                  Validates min and max selection rules!
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl border-white/10 bg-[#0E0E10] p-6 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2.5">
              <Sliders className="h-5 w-5 text-[#FCD223]" />
              {formMode === 'ADD' ? 'Create New Add-on Group' : `Edit Add-on Group: ${formName}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Define modifier rules, selection thresholds, optional/mandatory state, and options pricing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-3">
            {/* 1. Group Information */}
            <div className="space-y-3 rounded-xl border border-white/5 bg-[#141416] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#FCD223]">
                1. Group Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    Group Name * <span className="text-zinc-500 font-normal">(e.g. Extra Cheese, Sauces, Pizza Toppings)</span>
                  </label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Extra Cheese"
                    className="mt-1 border-white/10 bg-[#18181B] text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-300">Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief instruction displayed to customers, e.g. 'Select up to 3 gourmet cheeses melted on top'"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#18181B] p-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#FCD223] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Selection Type & Constraints */}
            <div className="space-y-4 rounded-xl border border-white/5 bg-[#141416] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#FCD223]">
                  2. Selection Rules &amp; Constraints
                </h3>

                {/* Required / Optional Switch */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-zinc-300">Required Selection?</label>
                  <button
                    type="button"
                    onClick={() => handleRequiredToggle(!formIsRequired)}
                    className={cn(
                      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                      formIsRequired ? 'bg-[#FCD223]' : 'bg-zinc-700'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform',
                        formIsRequired ? 'translate-x-4.5' : 'translate-x-1'
                      )}
                    />
                  </button>
                  <span className={cn('text-[11px] font-bold', formIsRequired ? 'text-[#FCD223]' : 'text-zinc-500')}>
                    {formIsRequired ? 'Required (Mandatory)' : 'Optional'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Selection Type */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Selection Type *</label>
                  <select
                    value={formSelectionType}
                    onChange={(e) => handleSelectionTypeChange(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-white focus:border-[#FCD223] focus:outline-none"
                  >
                    <option value="MULTIPLE">Multiple Choice (Checkboxes)</option>
                    <option value="SINGLE">Single Choice (Radio Button)</option>
                  </select>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {formSelectionType === 'SINGLE'
                      ? 'Customer chooses exactly one option (Max = 1).'
                      : 'Customer can pick multiple add-ons.'}
                  </p>
                </div>

                {/* Minimum Selection */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300">
                    Minimum Selection *
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={formMaxSelection}
                    value={formMinSelection}
                    onChange={(e) => setFormMinSelection(parseInt(e.target.value) || 0)}
                    disabled={formSelectionType === 'SINGLE'}
                    className="mt-1 border-white/10 bg-[#18181B] text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {formIsRequired ? 'Must be ≥ 1 when Required.' : 'Set to 0 for Optional.'}
                  </p>
                </div>

                {/* Maximum Selection */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300">
                    Maximum Selection *
                  </label>
                  <Input
                    type="number"
                    min={formMinSelection || 1}
                    max={formOptions.length || 10}
                    value={formMaxSelection}
                    onChange={(e) => setFormMaxSelection(parseInt(e.target.value) || 1)}
                    disabled={formSelectionType === 'SINGLE'}
                    className="mt-1 border-white/10 bg-[#18181B] text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {formSelectionType === 'SINGLE' ? 'Locked to 1 for Single Choice.' : 'Max options pickable.'}
                  </p>
                </div>
              </div>

              {/* Validation Helper Hint */}
              <div className="rounded-lg border border-white/5 bg-[#18181B] p-2.5 text-[11px] text-zinc-400 flex items-center gap-2">
                <Info className="h-4 w-4 text-[#FCD223] shrink-0" />
                <span>
                  Customer rule:{' '}
                  <strong className="text-white">
                    {formIsRequired
                      ? `Must select between ${formMinSelection} and ${formMaxSelection} options`
                      : `Optional (can pick 0 up to ${formMaxSelection} options)`}
                  </strong>
                </span>
              </div>
            </div>

            {/* 3. Add-on Options Table */}
            <div className="space-y-3 rounded-xl border border-white/5 bg-[#141416] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FCD223]">
                    3. Add-on Options ({formOptions.length})
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Individual options, extra price in EUR, and in-stock kitchen availability
                  </p>
                </div>
              </div>

              {/* Add Option Form Row */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 pb-2 border-b border-white/5">
                <div className="relative flex-1 w-full">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <Input
                    placeholder="Option name (e.g. Cheddar, Mozzarella, Parmesan)"
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    className="pl-9 text-xs border-white/10 bg-[#18181B] text-white"
                  />
                </div>

                <div className="relative w-full sm:w-40">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <Input
                    type="number"
                    step="0.10"
                    min="0"
                    placeholder="Price (€) e.g. 1.50"
                    value={newOptionPrice}
                    onChange={(e) => setNewOptionPrice(e.target.value)}
                    className="pl-9 text-xs border-white/10 bg-[#18181B] text-white font-mono"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleAddOptionToForm}
                  className="w-full sm:w-auto bg-[#FCD223] text-black font-bold text-xs hover:bg-[#FCD223]/90"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Option
                </Button>
              </div>

              {/* Options Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-zinc-400 uppercase">
                      <th className="py-2 px-2 w-16">Order</th>
                      <th className="py-2 px-3">Option Name</th>
                      <th className="py-2 px-3 w-28">Price Delta</th>
                      <th className="py-2 px-3 w-28 text-center">Availability</th>
                      <th className="py-2 px-2 w-12 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {formOptions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-zinc-500 text-[11px]">
                          No options added yet. Add at least one option above (e.g. Cheddar +€1.50).
                        </td>
                      </tr>
                    ) : (
                      formOptions.map((opt, idx) => (
                        <tr key={opt.id} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-2">
                            <span className="font-mono text-zinc-500 text-[11px]">#{idx + 1}</span>
                          </td>
                          <td className="py-2 px-3 font-semibold text-white">
                            {opt.name}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-[#FCD223]">
                            +{Number(opt.price).toFixed(2)} €
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleOptionAvail(opt.id)}
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[9px] font-bold border transition-colors',
                                opt.isAvailable
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                  : 'border-zinc-700 bg-zinc-800 text-zinc-500'
                              )}
                            >
                              {opt.isAvailable ? 'In Stock' : 'Out of Stock'}
                            </button>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionFromForm(opt.id)}
                              className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                              title="Remove option"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Associated Food Items */}
            <div className="space-y-3 rounded-xl border border-white/5 bg-[#141416] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FCD223]">
                    4. Associated Food Items ({formAssociatedItemIds.length} Linked)
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Select which dishes on the kitchen menu will offer this customization group
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllItems}
                  className="border-white/10 bg-white/5 text-[10px] text-zinc-300 hover:bg-white/10"
                >
                  {formAssociatedItemIds.length === AVAILABLE_FOOD_ITEMS.length
                    ? 'Deselect All'
                    : 'Select All Dishes'}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                {AVAILABLE_FOOD_ITEMS.map((dish) => {
                  const isChecked = formAssociatedItemIds.includes(dish.id);
                  return (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={() => handleToggleAssociatedItem(dish.id)}
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-2.5 text-left text-xs transition-all',
                        isChecked
                          ? 'border-[#FCD223] bg-[#FCD223]/10 text-white'
                          : 'border-white/5 bg-[#18181B] text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                      )}
                    >
                      <div className="pr-2">
                        <p className="font-semibold text-xs text-white line-clamp-1">{dish.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{dish.category}</p>
                      </div>
                      <div
                        className={cn(
                          'h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                          isChecked ? 'border-[#FCD223] bg-[#FCD223] text-black' : 'border-zinc-600 bg-transparent'
                        )}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 pt-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300 hover:bg-white/10"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSaveGroup}
              className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
            >
              {formMode === 'ADD' ? 'Save Add-on Group' : 'Update Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 15/16: GROUP INSPECTION & DETAILS MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-[#0E0E10] p-6 sm:p-7 text-white">
          {selectedGroup && (
            <div>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]">
                    {selectedGroup.isRequired ? 'Mandatory Selection' : 'Optional Add-on'}
                  </Badge>
                  <span className="text-zinc-600 text-xs">•</span>
                  <span className="text-xs text-zinc-400">
                    {selectedGroup.selectionType === 'SINGLE' ? 'Single Choice (Radio)' : 'Multiple Choice'}
                  </span>
                </div>
                <DialogTitle className="text-xl font-black text-white mt-1">
                  {selectedGroup.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  {selectedGroup.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Constraints Summary Cards */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/5 bg-[#141416] p-3 text-center">
                    <span className="text-[10px] text-zinc-500 uppercase">Min Choices</span>
                    <p className="font-mono text-base font-bold text-white mt-0.5">
                      {selectedGroup.minSelection}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#141416] p-3 text-center">
                    <span className="text-[10px] text-zinc-500 uppercase">Max Choices</span>
                    <p className="font-mono text-base font-bold text-[#FCD223] mt-0.5">
                      {selectedGroup.maxSelection}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#141416] p-3 text-center">
                    <span className="text-[10px] text-zinc-500 uppercase">Status</span>
                    <p className="text-xs font-bold text-emerald-400 mt-1">
                      {selectedGroup.status}
                    </p>
                  </div>
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white">Options &amp; Additional Pricing</h4>
                  <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-[#141416]">
                    {selectedGroup.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="p-3 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 text-[10px] font-mono">#{opt.displayOrder}</span>
                          <span className="font-semibold text-white">{opt.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#FCD223]">
                            +{Number(opt.price).toFixed(2)} €
                          </span>
                          <Badge
                            className={cn(
                              'text-[9px] font-bold',
                              opt.isAvailable
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                : 'border-zinc-700 bg-zinc-800 text-zinc-500'
                            )}
                          >
                            {opt.isAvailable ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linked Dishes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white">
                    Associated Food Dishes ({selectedGroup.associatedItemNames.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                    {selectedGroup.associatedItemNames.map((name, i) => (
                      <Badge
                        key={i}
                        className="border-white/10 bg-white/5 text-zinc-300 text-[11px] font-normal"
                      >
                        <Utensils className="h-2.5 w-2.5 mr-1 text-[#FCD223]" />
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-white/10 pt-3">
                <Button
                  onClick={() => setIsDetailsOpen(false)}
                  className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs w-full"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          DELETE CONFIRMATION MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md border-white/10 bg-[#0E0E10] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Delete Add-on Group
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Are you sure you want to delete{' '}
              <strong className="text-white">"{deletingGroup?.name}"</strong>?
              This will remove this customization option from all {deletingGroup?.associatedItemIds.length} linked food items.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
