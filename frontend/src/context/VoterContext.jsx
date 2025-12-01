import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import api from '../api/apiClient';
import { useAuth } from './AuthContext';

const VoterContext = createContext();

const initialState = {
  voters: [],
  currentVoter: null,
  loading: true,
  error: null,
  total: 0,
  pagination: {
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
};

const voterReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_VOTERS_REQUEST':
      return { ...state, loading: true, error: null };

    case 'FETCH_VOTERS_SUCCESS':
      return {
        ...state,
        loading: false,
        voters: action.payload.voters,
        total: action.payload.total,
        pagination: action.payload.pagination || state.pagination,
      };

    case 'FETCH_VOTERS_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'ADD_VOTER':
      return {
        ...state,
        voters: [...state.voters, action.payload],
      };

    case 'UPDATE_VOTER':
      return {
        ...state,
        voters: state.voters.map((voter) =>
          String(voter._id) === String(action.payload._id)
            ? { ...voter, ...action.payload }
            : voter
        ),
      };

    case 'DELETE_VOTER':
      return {
        ...state,
        voters: state.voters.filter(
          (voter) => String(voter._id) !== String(action.payload)
        ),
      };

    case 'SET_CURRENT_VOTER':
      return {
        ...state,
        currentVoter: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

export const VoterProvider = ({ children }) => {
  const [state, dispatch] = useReducer(voterReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load voters from backend with pagination
  const fetchVoters = useCallback(async (page = 1, limit = 10) => {
    console.log('[VoterContext] fetchVoters called', { page, limit });
    dispatch({ type: 'FETCH_VOTERS_REQUEST' });
    try {
      console.log(
        '[VoterContext] Requesting voters from /users with pagination',
        { page, limit }
      );
      const response = await api.get(`/users?page=${page}&limit=${limit}`);
      console.log('[VoterContext] Response:', response);

      const raw =
        response?.data?.data ||
        response?.data?.users ||
        response?.data ||
        response;

      const votersArray = Array.isArray(raw) ? raw : [];

      const meta = response?.data?.meta?.pagination || {};
      const totalFromMeta = meta.total ?? votersArray.length;
      const pageFromMeta = parseInt(meta.page, 10) || page || 1;
      const pageSizeFromMeta = parseInt(meta.pageSize, 10) || limit || 10;
      const totalPagesFromMeta =
        totalFromMeta && pageSizeFromMeta
          ? Math.ceil(totalFromMeta / pageSizeFromMeta)
          : 1;

      console.log('[VoterContext] Voters fetch success', {
        arrayLength: votersArray.length,
        totalFromMeta,
        page: pageFromMeta,
        pageSize: pageSizeFromMeta,
        totalPages: totalPagesFromMeta,
      });

      dispatch({
        type: 'FETCH_VOTERS_SUCCESS',
        payload: {
          voters: votersArray,
          total: totalFromMeta,
          pagination: {
            page: pageFromMeta,
            pageSize: pageSizeFromMeta,
            totalPages: totalPagesFromMeta,
          },
        },
      });
    } catch (error) {
      console.error('Failed to fetch voters:', error);
      dispatch({
        type: 'FETCH_VOTERS_FAILURE',
        payload: error.message || 'Failed to load voters',
      });
    }
  }, []);

  useEffect(() => {
    // Only fetch voters when the user is authenticated AND an admin/sysadmin
    if (
      !isAuthenticated ||
      !user ||
      (user.role !== 'admin' && user.role !== 'sysadmin')
    ) {
      console.log('[VoterContext] Skipping fetchVoters for user/role', {
        isAuthenticated,
        hasUser: !!user,
        role: user?.role,
      });
      // Ensure loading state is cleared for public/non-admin views
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    console.log(
      '[VoterContext] Authenticated admin/sysadmin detected, fetching voters'
    );
    fetchVoters(1, state.pagination.pageSize || 10);
  }, [fetchVoters, isAuthenticated, user, state.pagination.pageSize]);

  // Add a new voter
  const addVoter = async (voterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // In a real app, you would make an API call here
      const newVoter = {
        ...voterData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_VOTER', payload: newVoter });
      return newVoter;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Update an existing voter
  const updateVoter = async (id, voterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // In a real app, you would make an API call here
      const response = await api.patch(`/users/${id}`, voterData);

      const raw =
        response?.data?.data ||
        response?.data?.user ||
        response?.data ||
        response;

      const updatedVoter = {
        ...voterData,
        ...raw,
      };

      dispatch({ type: 'UPDATE_VOTER', payload: updatedVoter });
      return updatedVoter;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Delete a voter
  const deleteVoter = async (voterId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      await api.delete(`/users/${voterId}`);

      dispatch({ type: 'DELETE_VOTER', payload: voterId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Get a voter by ID
  const getVoterById = (id) => {
    return state.voters.find(
      (voter) => String(voter._id) === String(id) || voter.id === id
    );
  };

  // Set the current voter
  const setCurrentVoter = (voter) => {
    dispatch({ type: 'SET_CURRENT_VOTER', payload: voter });
  };

  // Clear the current voter
  const clearCurrentVoter = () => {
    dispatch({ type: 'SET_CURRENT_VOTER', payload: null });
  };

  // Get all voters
  const getVoters = () => {
    return state.voters;
  };

  // Get voters by status
  const getVotersByStatus = (status) => {
    return state.voters.filter((voter) => voter.status === status);
  };

  // Get voters who have/haven't voted
  const getVotersByVotingStatus = (hasVoted) => {
    return state.voters.filter((voter) => voter.hasVoted === hasVoted);
  };

  return (
    <VoterContext.Provider
      value={{
        voters: state.voters,
        currentVoter: state.currentVoter,
        loading: state.loading,
        error: state.error,
        total: state.total,
        pagination: state.pagination,
        fetchVoters,
        addVoter,
        updateVoter,
        deleteVoter,
        getVoterById,
        setCurrentVoter,
        clearCurrentVoter,
        getVoters,
        getVotersByStatus,
        getVotersByVotingStatus,
      }}>
      {children}
    </VoterContext.Provider>
  );
};

export const useVoter = () => {
  const context = useContext(VoterContext);
  if (!context) {
    throw new Error('useVoter must be used within a VoterProvider');
  }
  return context;
};

export default VoterContext;
