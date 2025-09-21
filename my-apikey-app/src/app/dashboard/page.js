'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Custom Hooks
import { useApiKeys } from '@/hooks/useApiKeys';
import { useToast } from '@/hooks/useToast';
import { useModal } from '@/hooks/useModal';


// Components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import PlanCard from '@/components/dashboard/PlanCard';
import ApiKeysTable from '@/components/dashboard/ApiKeysTable';
import ApiKeyModal from '@/components/dashboard/ApiKeyModal';

export default function Dashboard() {
  const { showToast } = useToast();
  const { apiKeys, loading, createApiKey, updateApiKey, deleteApiKey } = useApiKeys(showToast);
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  
  const [editingKey, setEditingKey] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleCreateNew = () => {
    setEditingKey(null);
    openModal();
  };

  const handleEdit = (key) => {
    setEditingKey(key);
    openModal();
  };

  const handleCopy = async (keyText) => {
    try {
      await navigator.clipboard.writeText(keyText);
      showToast('Copied API Key to clipboard', 'success');
    } catch (error) {
      showToast('Failed to copy API Key to clipboard', 'error');
    }
  };
  
  const handleSubmitModal = async (formData) => {
    let success = false;
    try {
      if (editingKey) {
        success = await updateApiKey(editingKey.id, formData);
      } else {
        success = await createApiKey(formData);
      }

      if (success) {
        closeModal();
        setEditingKey(null);
      }
    } catch (error) {
      console.error('Error in handleSubmitModal:', error);
      showToast('An error occurred while processing the request', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1">
        <Header breadcrumbs={[{ label: 'Pages' }, { label: 'Overview' }]}>
          Overview
        </Header>

        <main className="p-6">
          <PlanCard />
          <ApiKeysTable
            apiKeys={apiKeys}
            loading={loading}
            onEdit={handleEdit}
            onDelete={deleteApiKey}
            onCopy={handleCopy}
            onCreate={handleCreateNew}
          />
        </main>
      </div>

      <ApiKeyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
        editingKey={editingKey}
      />

    </div>
  );
}
