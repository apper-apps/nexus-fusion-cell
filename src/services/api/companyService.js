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
        { field: { Name: "industry" } },
        { field: { Name: "website" } },
        { field: { Name: "employeeCount" } }
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

    const response = await client.fetchRecords('company', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching companies:", error?.response?.data?.message);
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
        { field: { Name: "industry" } },
        { field: { Name: "website" } },
        { field: { Name: "employeeCount" } }
      ]
    };

    const response = await client.getRecordById('company', parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error(`Error fetching company with ID ${id}:`, error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return null;
  }
};

export const create = async (companyData) => {
  try {
    const client = initializeClient();
    
    // Only include Updateable fields
    const updateableData = {
      Name: companyData.Name || companyData.name,
      Tags: companyData.Tags || "",
      Owner: companyData.Owner,
      industry: companyData.industry || "",
      website: companyData.website || "",
      employeeCount: parseInt(companyData.employeeCount) || 0
    };

    const params = {
      records: [updateableData]
    };

    const response = await client.createRecord('company', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create company ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success('Company created successfully');
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error creating company:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return null;
  }
};

export const update = async (id, companyData) => {
  try {
    const client = initializeClient();
    
    // Only include Updateable fields plus Id
    const updateableData = {
      Id: parseInt(id),
      Name: companyData.Name || companyData.name,
      Tags: companyData.Tags,
      Owner: companyData.Owner,
      industry: companyData.industry,
      website: companyData.website,
      employeeCount: parseInt(companyData.employeeCount) || 0
    };

    const params = {
      records: [updateableData]
    };

    const response = await client.updateRecord('company', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update company ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success('Company updated successfully');
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating company:", error?.response?.data?.message);
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

    const response = await client.deleteRecord('company', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete company ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Company deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting company:", error?.response?.data?.message);
    } else {
      console.error(error.message);
    }
    return false;
  }
};