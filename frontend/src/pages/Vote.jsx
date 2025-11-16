import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useElection } from '../context/ElectionContext';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiCheckCircle, FiUser, FiCheck, FiAward } from 'react-icons/fi';

const Vote = () => {
  const { electionId } = useParams();
  const { getElectionById, submitVote } = useElection();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [voterId, setVoterId] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const foundElection = getElectionById(electionId);
    if (!foundElection) {
      toast.error("Election not found");
      navigate("/");
      return;
    }
    setElection(foundElection);

    // Check if already voted (in a real app, this would be more secure)
    const votedElections = JSON.parse(
      localStorage.getItem("votedElections") || "{}"
    );
    if (votedElections[electionId]) {
      setHasVoted(true);
      setVoterId(votedElections[electionId]);
    }
  }, [electionId, getElectionById, navigate]);

  const handleSubmitVote = (e) => {
    e.preventDefault();

    if (!voterId.trim()) {
      toast.error('Please enter your voter ID');
      return;
    }

    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmVote = () => {
    if (!selectedCandidate) return;
    
    setIsSubmitting(true);
    setShowConfirmation(false);

    try {
      // In a real app, this would be handled by a backend with proper authentication
      const votedElections = JSON.parse(
        localStorage.getItem("votedElections") || "{}"
      );
      votedElections[electionId] = voterId;
      localStorage.setItem("votedElections", JSON.stringify(votedElections));

      submitVote(electionId, voterId, selectedCandidate);
      setHasVoted(true);
      toast.success("Your vote has been submitted successfully!");
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error("Failed to submit vote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!election) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading election details...</p>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You for Voting!
          </h2>
          <p className="text-gray-600 mb-6">
            Your vote in <span className="font-semibold">{election.title}</span>{" "}
            has been recorded.
          </p>
          <button
            onClick={() => navigate(`/results/${election.id}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }

  const selectedCandidateData = election.candidates.find(c => c.id === selectedCandidate);

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors active:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          <FiArrowLeft className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate">Back to Elections</span>
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 sm:p-6 text-white">
          <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{election.title}</h1>
          <p className="text-sm sm:text-base opacity-90">{election.description}</p>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0 pt-0.5">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm text-blue-700">
                  Please verify your voter ID and select your preferred candidate. Your vote is anonymous and cannot be changed once submitted.
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmitVote} className="space-y-6">
            <div>
              <label htmlFor="voterId" className="block text-sm font-medium text-gray-700 mb-1">
                Voter ID <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="voterId"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 pr-10 py-2.5 sm:py-3 text-sm sm:text-base border-gray-300 rounded-lg border"
                  placeholder="Enter your voter ID"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Enter the voter ID you received via email or SMS
              </p>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2 sm:mb-3">Select your preferred candidate</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                Review the candidates and select your choice by clicking on the candidate card.
              </p>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {election.candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`relative rounded-xl border-2 p-3 sm:p-4 transition-all cursor-pointer ${
                      selectedCandidate === candidate.id
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                    onClick={() => !isSubmitting && setSelectedCandidate(candidate.id)}
                  >
                    {selectedCandidate === candidate.id && (
                      <div className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full p-1">
                        <FiCheck className="h-3 w-3" />
                      </div>
                    )}
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary-100 flex items-center justify-center text-lg sm:text-xl font-medium text-primary-700">
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3 sm:ml-4 overflow-hidden">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">{candidate.name}</h4>
                        {candidate.party && (
                          <p className="text-xs sm:text-sm text-primary-600 font-medium truncate">{candidate.party}</p>
                        )}
                        {candidate.bio && (
                          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{candidate.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 sm:px-5 py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors active:bg-gray-100"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedCandidate || !voterId.trim()}
                className={`px-4 sm:px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white ${
                  isSubmitting || !selectedCandidate || !voterId.trim()
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 active:scale-[0.98]'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-150 ease-in-out`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Vote'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
                  <FiCheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Your Vote</h3>
                
                <div className="w-full bg-gray-50 rounded-lg p-4 my-4 border border-gray-100">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-lg font-semibold text-primary-700">
                      {selectedCandidateData?.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-4 text-left">
                      <h4 className="text-base font-semibold text-gray-900">{selectedCandidateData?.name}</h4>
                      {selectedCandidateData?.party && (
                        <p className="text-sm text-primary-600">{selectedCandidateData.party}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mb-6">
                  You are about to cast your vote for <span className="font-semibold text-gray-900">{selectedCandidateData?.name}</span> in the {election.title}.
                  <br />
                  <span className="text-red-500 font-medium">This action cannot be undone.</span>
                </p>
                
                <div className="w-full flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors active:bg-gray-100"
                    onClick={() => setShowConfirmation(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`w-full px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white ${
                      isSubmitting 
                        ? 'bg-green-500 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors`}
                    onClick={confirmVote}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <FiCheckCircle className="mr-2 h-4 w-4" />
                        Confirm Vote
                      </span>
                    )}
                  </button>
                </div>
                
                <p className="mt-4 text-xs text-gray-400">
                  Your vote is secure and anonymous
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vote;
