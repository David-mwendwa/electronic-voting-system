import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import electionsData from '../data/elections.json';

const ElectionContext = createContext();

// Check if we have saved elections in localStorage, otherwise use JSON dummy data
const savedElections = JSON.parse(localStorage.getItem('elections'));
const initialElections =
  savedElections && savedElections.length > 0 ? savedElections : electionsData;

// Function to determine election status based on current date
const getElectionStatus = (election) => {
  const now = new Date();
  const startDate = new Date(election.startDate || election.votingStarts);
  const endDate = new Date(election.endDate || election.votingEnds);

  if (now < startDate) return 'Upcoming';
  if (now >= startDate && now <= endDate) return 'Active';
  return 'Completed';
};

// Process initial elections to ensure status is set correctly
const processedInitialElections = initialElections.map((election) => ({
  ...election,
  status: election.status || getElectionStatus(election),
}));

const initialState = {
  elections: processedInitialElections,
  currentElection: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_ELECTION':
      const newElection = {
        id: uuidv4(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        voters: [],
        results: {},
        status: getElectionStatus(action.payload), // Set initial status based on dates
      };
      return {
        ...state,
        elections: [...state.elections, newElection],
        currentElection: newElection,
      };

    case 'SUBMIT_VOTE':
      const { electionId, candidateId, voterId } = action.payload;
      const updatedElections = state.elections.map((election) => {
        if (election.id === electionId) {
          const updatedResults = {
            ...election.results,
            [candidateId]: (election.results[candidateId] || 0) + 1,
          };

          // Add voter to the election's voters array if not already there
          const voterExists = election.voters?.some((v) => v.id === voterId);
          const updatedVoters = voterExists
            ? election.voters.map((v) =>
                v.id === voterId
                  ? {
                      ...v,
                      votedFor: candidateId,
                      votedAt: new Date().toISOString(),
                    }
                  : v
              )
            : [
                ...(election.voters || []),
                {
                  id: voterId,
                  votedFor: candidateId,
                  votedAt: new Date().toISOString(),
                },
              ];

          return {
            ...election,
            results: updatedResults,
            voters: updatedVoters,
          };
        }
        return election;
      });
      return {
        ...state,
        elections: updatedElections,
      };

    case 'UPDATE_ELECTION':
      return {
        ...state,
        elections: state.elections.map((election) =>
          election.id === action.payload.id
            ? {
                ...election,
                ...action.payload,
                status: getElectionStatus({
                  ...election,
                  ...action.payload,
                }), // Update status when election is updated
              }
            : election
        ),
      };

    case 'DELETE_ELECTION':
      return {
        ...state,
        elections: state.elections.filter(
          (election) => election.id !== action.payload
        ),
        currentElection:
          state.currentElection && state.currentElection.id === action.payload
            ? null
            : state.currentElection,
      };

    case 'SET_CURRENT_ELECTION':
      return {
        ...state,
        currentElection: action.payload,
      };

    case 'ADD_VOTER':
      return {
        ...state,
        voters: [...state.voters, action.payload],
      };

    default:
      return state;
  }
};

export const ElectionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    localStorage.setItem('elections', JSON.stringify(state.elections));
  }, [state.elections]);

  const createElection = (electionData) => {
    dispatch({ type: 'CREATE_ELECTION', payload: electionData });
  };

  const updateElection = (electionData) => {
    dispatch({ type: 'UPDATE_ELECTION', payload: electionData });
  };

  const submitVote = (electionId, voterId, candidateId) => {
    dispatch({
      type: 'SUBMIT_VOTE',
      payload: { electionId, voterId, candidateId },
    });
  };

  const getElectionById = (id) => {
    return state.elections.find((election) => election.id === id);
  };

  const setCurrentElection = (election) => {
    dispatch({ type: 'SET_CURRENT_ELECTION', payload: election });
  };

  const deleteElection = (id) => {
    dispatch({ type: 'DELETE_ELECTION', payload: id });
  };

  return (
    <ElectionContext.Provider
      value={{
        elections: state.elections,
        currentElection: state.currentElection,
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
