// src/context/ElectionContext.jsx
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import api from '../api/apiClient';

const ElectionContext = createContext();

const initialState = {
  elections: [],
  currentElection: null,
  loading: false,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_ELECTIONS_REQUEST':
      return { ...state, loading: true, error: null };

    case 'FETCH_ELECTIONS_SUCCESS':
      return { ...state, loading: false, elections: action.payload };

    case 'FETCH_ELECTIONS_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'SET_CURRENT_ELECTION':
      return { ...state, currentElection: action.payload };

    case 'CREATE_ELECTION':
      return {
        ...state,
        elections: [...state.elections, action.payload],
        currentElection: action.payload,
      };

    case 'UPDATE_ELECTION':
      return {
        ...state,
        elections: state.elections.map((election) =>
          election._id === action.payload._id ? action.payload : election
        ),
        currentElection:
          state.currentElection?._id === action.payload._id
            ? action.payload
            : state.currentElection,
      };

    case 'DELETE_ELECTION':
      return {
        ...state,
        elections: state.elections.filter(
          (election) => election._id !== action.payload
        ),
        currentElection:
          state.currentElection?._id === action.payload
            ? null
            : state.currentElection,
      };

    case 'SUBMIT_VOTE':
      return {
        ...state,
        elections: state.elections.map((election) =>
          election._id === action.payload.electionId
            ? { ...election, results: action.payload.results }
            : election
        ),
      };

    default:
      return state;
  }
};

export const ElectionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch all elections
  const fetchElections = useCallback(async () => {
    dispatch({ type: 'FETCH_ELECTIONS_REQUEST' });
    try {
      const response = await api.get('/elections');

      // Support different backend response shapes and always store an array
      const raw =
        response?.data?.data ||
        response?.data?.elections ||
        response?.data ||
        response;

      const electionsArray = Array.isArray(raw) ? raw : [];
      console.log({ electionsArray });

      dispatch({ type: 'FETCH_ELECTIONS_SUCCESS', payload: electionsArray });
    } catch (error) {
      dispatch({ type: 'FETCH_ELECTIONS_FAILURE', payload: error.message });
      console.error('Failed to fetch elections:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  // Get election by ID
  const getElectionById = useCallback(
    (id) => {
      return state.elections.find((election) => election._id === id);
    },
    [state.elections]
  );

  // Set current election
  const setCurrentElection = useCallback((election) => {
    dispatch({ type: 'SET_CURRENT_ELECTION', payload: election });
  }, []);

  // Create election
  const createElection = async (electionData) => {
    try {
      const response = await api.post('/elections', electionData);
      const created =
        response?.data?.data ||
        response?.data?.election ||
        response?.data ||
        response;

      dispatch({ type: 'CREATE_ELECTION', payload: created });
      return created;
    } catch (error) {
      console.error('Failed to create election:', error);
      throw error;
    }
  };

  // Update election
  const updateElection = async (electionData) => {
    try {
      const response = await api.patch(
        `/elections/${electionData._id}`,
        electionData
      );
      const updated =
        response?.data?.data ||
        response?.data?.election ||
        response?.data ||
        response;

      dispatch({ type: 'UPDATE_ELECTION', payload: updated });
      return updated;
    } catch (error) {
      console.error('Failed to update election:', error);
      throw error;
    }
  };

  // Delete election
  const deleteElection = async (id) => {
    try {
      await api.delete(`/elections/${id}`);
      dispatch({ type: 'DELETE_ELECTION', payload: id });
    } catch (error) {
      console.error('Failed to delete election:', error);
      throw error;
    }
  };

  // Submit vote
  const submitVote = async (electionId, candidateId) => {
    try {
      const response = await api.post(`/elections/${electionId}/vote`, {
        candidateId,
      });

      const updatedElection =
        response?.data?.data ||
        response?.data?.election ||
        response?.data ||
        response;

      dispatch({
        type: 'SUBMIT_VOTE',
        payload: {
          electionId,
          results: updatedElection.results,
        },
      });
      return updatedElection;
    } catch (error) {
      console.error('Failed to submit vote:', error);
      throw error;
    }
  };

  return (
    <ElectionContext.Provider
      value={{
        elections: state.elections,
        currentElection: state.currentElection,
        loading: state.loading,
        error: state.error,
        fetchElections,
        createElection,
        updateElection,
        deleteElection,
        submitVote,
        getElectionById,
        setCurrentElection,
      }}>
      {children}
    </ElectionContext.Provider>
  );
};

export const useElection = () => {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
};
