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
        { field: { Name: "value" } },
        { field: { Name: "probability" } },
        { field: { Name: "stage" } },
        { field: { Name: "expectedCloseDate" } },
        { field: { Name: "createdAt" } },
        { field: { Name: "updatedAt" } },
        { field: { Name: "description" } },
        { field: { Name: "notes" } },
        { field: { Name: "contactId" } },
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

    const response = await client.fetchRecords('deal', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching deals:", error?.response?.data?.message);
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
        { field: { Name: "value" } },
        { field: { Name: "probability" } },
        { field: { Name: "stage" } },
        { field: { Name: "expectedCloseDate" } },
        { field: { Name: "createdAt" } },
        { field: { Name: "updatedAt" } },
        { field: { Name: "description" } },
        { field: { Name: "notes" } },
        { field: { Name: "contactId" } },
        { field: { Name: "companyId" } }
      ]
    };

    const response = await client.getRecordById('deal', parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error(`Error fetching deal with ID ${id}:`, error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return null;
  }
};

export const create = async (dealData) => {
  try {
    const client = initializeClient();
    
    // Only include Updateable fields
    const updateableData = {
      Name: dealData.Name || dealData.name,
      Tags: dealData.Tags || "",
      Owner: dealData.Owner,
      value: parseFloat(dealData.value) || 0,
      probability: parseInt(dealData.probability) || 0,
      stage: dealData.stage || "Prospect",
      expectedCloseDate: dealData.expectedCloseDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: dealData.description || "",
      notes: dealData.notes || "",
      contactId: dealData.contactId ? parseInt(dealData.contactId) : null,
      companyId: dealData.companyId ? parseInt(dealData.companyId) : null
    };

    const params = {
      records: [updateableData]
    };

    const response = await client.createRecord('deal', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create deal ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success('Deal created successfully');
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error creating deal:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return null;
  }
};

export const update = async (id, dealData) => {
  try {
    const client = initializeClient();
    
    // Only include Updateable fields plus Id
    const updateableData = {
      Id: parseInt(id),
      Name: dealData.Name || dealData.name,
      Tags: dealData.Tags,
      Owner: dealData.Owner,
      value: dealData.value !== undefined ? parseFloat(dealData.value) : undefined,
      probability: dealData.probability !== undefined ? parseInt(dealData.probability) : undefined,
      stage: dealData.stage,
      expectedCloseDate: dealData.expectedCloseDate,
      updatedAt: new Date().toISOString(),
      description: dealData.description,
      notes: dealData.notes,
      contactId: dealData.contactId ? parseInt(dealData.contactId) : null,
      companyId: dealData.companyId ? parseInt(dealData.companyId) : null
    };

    // Remove undefined values
    Object.keys(updateableData).forEach(key => {
      if (updateableData[key] === undefined) {
        delete updateableData[key];
      }
    });

    const params = {
      records: [updateableData]
    };

    const response = await client.updateRecord('deal', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update deal ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success('Deal updated successfully');
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating deal:", error?.response?.data?.message);
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

    const response = await client.deleteRecord('deal', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete deal ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Deal deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting deal:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return false;
  }
};

export const updateStage = async (id, newStage) => {
  try {
    const client = initializeClient();
    
    const updateableData = {
      Id: parseInt(id),
      stage: newStage,
      updatedAt: new Date().toISOString()
    };

    const params = {
      records: [updateableData]
    };

    const response = await client.updateRecord('deal', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update deal stage ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating deal stage:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return null;
  }
};

export const getByStage = async (stage) => {
  try {
    const client = initializeClient();
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "value" } },
        { field: { Name: "probability" } },
        { field: { Name: "stage" } },
        { field: { Name: "expectedCloseDate" } },
        { field: { Name: "createdAt" } },
        { field: { Name: "updatedAt" } },
        { field: { Name: "description" } },
        { field: { Name: "notes" } },
        { field: { Name: "contactId" } },
        { field: { Name: "companyId" } }
      ],
      where: [
        {
          FieldName: "stage",
          Operator: "EqualTo",
          Values: [stage],
          Include: true
        }
      ],
      orderBy: [
        {
          fieldName: "CreatedOn",
          sorttype: "DESC"
        }
      ]
    };

    const response = await client.fetchRecords('deal', params);
    
    if (!response.success) {
      console.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching deals by stage:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return [];
  }
};

// Valid deal stages
export const DEAL_STAGES = {
  PROSPECT: 'Prospect',
  QUALIFIED: 'Qualified', 
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost'
};

export const STAGE_ORDER = [
  DEAL_STAGES.PROSPECT,
  DEAL_STAGES.QUALIFIED,
  DEAL_STAGES.PROPOSAL,
  DEAL_STAGES.NEGOTIATION,
  DEAL_STAGES.CLOSED_WON,
  DEAL_STAGES.CLOSED_LOST
];