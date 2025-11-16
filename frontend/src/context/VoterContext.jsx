import { createContext, useContext, useReducer, useEffect } from 'react';
import votersData from '../data/voters.json';

const VoterContext = createContext();

// Check if we have saved voters in localStorage, otherwise use JSON dummy data
const savedVoters = JSON.parse(localStorage.getItem('voters'));
const initialVoters =
  savedVoters && savedVoters.length > 0 ? savedVoters : votersData;

const initialState = {
  voters: initialVoters,
  currentVoter: null,
  isLoading: false,
  error: null,
};

const voterReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_VOTER':
      return {
        ...state,
        voters: [...state.voters, action.payload],
      };

    case 'UPDATE_VOTER':
      return {
        ...state,
        voters: state.voters.map((voter) =>
          voter.id === action.payload.id
            ? { ...voter, ...action.payload }
            : voter
        ),
      };

    case 'DELETE_VOTER':
      return {
        ...state,
        voters: state.voters.filter((voter) => voter.id !== action.payload),
      };

    case 'SET_CURRENT_VOTER':
      return {
        ...state,
        currentVoter: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
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

  // Save voters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('voters', JSON.stringify(state.voters));
  }, [state.voters]);

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
      const updatedVoter = {
        ...voterData,
        id,
        updatedAt: new Date().toISOString(),
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
  const deleteVoter = (voterId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
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
    return state.voters.find((voter) => voter.id === id);
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
        isLoading: state.isLoading,
        error: state.error,
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
