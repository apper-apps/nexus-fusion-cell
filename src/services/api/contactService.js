import { toast } from 'react-toastify';

let apperClient;

const initializeClient = () => {
  if (!apperClient) {
    const { ApperClient } = window.ApperSDK;
    apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }
  return apperClient;
};

export const getAll = async () => {
  try {
    const client = initializeClient();
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "firstName" } },
        { field: { Name: "lastName" } },
        { field: { Name: "email" } },
        { field: { Name: "phone" } },
        { field: { Name: "lifecycleStage" } },
        { field: { Name: "createdAt" } },
        { field: { Name: "updatedAt" } },
        { field: { Name: "notes" } },
        { field: { Name: "companyId" } }
      ],
      orderBy: [
        {
          fieldName: "CreatedOn",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: 100,
        offset: 0
      }
    };

    const response = await client.fetchRecords('app_contact', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching contacts:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return [];
  }
};

export const getById = async (id) => {
  try {
    const client = initializeClient();
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "firstName" } },
        { field: { Name: "lastName" } },
        { field: { Name: "email" } },
        { field: { Name: "phone" } },
        { field: { Name: "lifecycleStage" } },
        { field: { Name: "createdAt" } },
        { field: { Name: "updatedAt" } },
        { field: { Name: "notes" } },
        { field: { Name: "companyId" } }
      ]
    };

    const response = await client.getRecordById('app_contact', parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error(`Error fetching contact with ID ${id}:`, error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return null;
  }
};

export const create = async (contactData) => {
  try {
    const client = initializeClient();
    
    // Only include Updateable fields
    const updateableData = {
      Name: contactData.Name || `${contactData.firstName} ${contactData.lastName}`,
      Tags: contactData.Tags || "",
      Owner: contactData.Owner,
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      phone: contactData.phone || "",
      lifecycleStage: contactData.lifecycleStage || "Lead",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: contactData.notes || "",
      companyId: contactData.companyId ? parseInt(contactData.companyId) : null
    };

    const params = {
      records: [updateableData]
    };

    const response = await client.createRecord('app_contact', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create contact ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success('Contact created successfully');
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error creating contact:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return null;
  }
};

export const update = async (id, contactData) => {
  try {
    const client = initializeClient();
    
    // Only include Updateable fields plus Id
    const updateableData = {
      Id: parseInt(id),
      Name: contactData.Name || `${contactData.firstName} ${contactData.lastName}`,
      Tags: contactData.Tags,
      Owner: contactData.Owner,
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      phone: contactData.phone,
      lifecycleStage: contactData.lifecycleStage,
      updatedAt: new Date().toISOString(),
      notes: contactData.notes,
      companyId: contactData.companyId ? parseInt(contactData.companyId) : null
    };

    const params = {
      records: [updateableData]
    };

    const response = await client.updateRecord('app_contact', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update contact ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success('Contact updated successfully');
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating contact:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return null;
  }
};

export const delete_ = async (id) => {
  try {
    const client = initializeClient();
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await client.deleteRecord('app_contact', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete contact ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Contact deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting contact:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return false;
  }
};

export const bulkDelete = async (contactIds) => {
  try {
    const client = initializeClient();
    const params = {
      RecordIds: contactIds.map(id => parseInt(id))
    };

    const response = await client.deleteRecord('app_contact', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete contacts ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success(`${successfulDeletions.length} contacts deleted successfully`);
        return successfulDeletions.length === contactIds.length;
      }
    }
    
    return false;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting contacts:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return false;
  }
};

export const bulkUpdateLifecycleStage = async (contactIds, lifecycleStage) => {
  try {
    const client = initializeClient();
    
    const records = contactIds.map(id => ({
      Id: parseInt(id),
      lifecycleStage: lifecycleStage,
      updatedAt: new Date().toISOString()
    }));

    const params = {
      records: records
    };

    const response = await client.updateRecord('app_contact', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update lifecycle stage ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success(`${successfulUpdates.length} contacts updated successfully`);
        return successfulUpdates.map(result => result.data);
      }
    }
    
    return [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating lifecycle stage:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return [];
  }
};