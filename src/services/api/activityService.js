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
        { field: { Name: "contactId" } },
        { field: { Name: "dealId" } },
        { field: { Name: "type" } },
        { field: { Name: "description" } },
        { field: { Name: "timestamp" } }
      ],
      orderBy: [
        {
          fieldName: "timestamp",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: 100,
        offset: 0
      }
    };

    const response = await client.fetchRecords('app_Activity', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching activities:", error?.response?.data?.message);
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
        { field: { Name: "contactId" } },
        { field: { Name: "dealId" } },
        { field: { Name: "type" } },
        { field: { Name: "description" } },
        { field: { Name: "timestamp" } }
      ]
    };

    const response = await client.getRecordById('app_Activity', parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error(`Error fetching activity with ID ${id}:`, error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return null;
  }
};

export const getByContactId = async (contactId) => {
  try {
    const client = initializeClient();
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "contactId" } },
        { field: { Name: "dealId" } },
        { field: { Name: "type" } },
        { field: { Name: "description" } },
        { field: { Name: "timestamp" } }
      ],
      where: [
        {
          FieldName: "contactId",
          Operator: "EqualTo",
          Values: [parseInt(contactId)],
          Include: true
        }
      ],
      orderBy: [
        {
          fieldName: "timestamp",
          sorttype: "DESC"
        }
      ]
    };

    const response = await client.fetchRecords('app_Activity', params);
    
    if (!response.success) {
      console.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching activities by contact:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return [];
  }
};

export const create = async (activityData) => {
  try {
    const client = initializeClient();
    
    // Only include Updateable fields
    const updateableData = {
      Name: activityData.Name || activityData.type || "Activity",
      Tags: activityData.Tags || "",
      Owner: activityData.Owner,
      contactId: activityData.contactId ? parseInt(activityData.contactId) : null,
      dealId: activityData.dealId ? parseInt(activityData.dealId) : null,
      type: activityData.type || "",
      description: activityData.description || "",
      timestamp: activityData.timestamp || new Date().toISOString()
    };

    const params = {
      records: [updateableData]
    };

    const response = await client.createRecord('app_Activity', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create activity ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success('Activity created successfully');
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error creating activity:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return null;
  }
};

export const update = async (id, activityData) => {
  try {
    const client = initializeClient();
    
    // Only include Updateable fields plus Id
    const updateableData = {
      Id: parseInt(id),
      Name: activityData.Name || activityData.type,
      Tags: activityData.Tags,
      Owner: activityData.Owner,
      contactId: activityData.contactId ? parseInt(activityData.contactId) : null,
      dealId: activityData.dealId ? parseInt(activityData.dealId) : null,
      type: activityData.type,
      description: activityData.description,
      timestamp: activityData.timestamp
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

    const response = await client.updateRecord('app_Activity', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update activity ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success('Activity updated successfully');
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating activity:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return null;
  }
};

export const getByDealId = async (dealId) => {
  try {
    const client = initializeClient();
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "contactId" } },
        { field: { Name: "dealId" } },
        { field: { Name: "type" } },
        { field: { Name: "description" } },
        { field: { Name: "timestamp" } }
      ],
      where: [
        {
          FieldName: "dealId",
          Operator: "EqualTo",
          Values: [parseInt(dealId)],
          Include: true
        }
      ],
      orderBy: [
        {
          fieldName: "timestamp",
          sorttype: "DESC"
        }
      ]
    };

    const response = await client.fetchRecords('app_Activity', params);
    
    if (!response.success) {
      console.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching activities by deal:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return [];
  }
};

export const delete_ = async (id) => {
  try {
    const client = initializeClient();
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await client.deleteRecord('app_Activity', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete activity ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Activity deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting activity:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return false;
  }
};