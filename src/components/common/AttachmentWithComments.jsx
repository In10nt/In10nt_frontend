import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  Collapse,
  Alert
} from '@mui/material'
import {
  Comment,
  Reply,
  ExpandMore,
  ExpandLess,
  Link as LinkIcon,
  Image as ImageIcon,
  Visibility,
  Edit,
  Undo,
  Send,
  AttachFile
} from '@mui/icons-material'
import api from '../../api/axios'

function AttachmentWithComments({ attachment, currentUser, onAttachmentUpdate, isAdmin = false }) {
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [statusAction, setStatusAction] = useState('')
  const [statusComment, setStatusComment] = useState('')

  useEffect(() => {
    if (showComments) {
      fetchComments()
    }
  }, [showComments, attachment.id])

  const fetchComments = async () => {
    try {
      const response = await api.get(`/attachment-comments/attachment/${attachment.id}`)
      setComments(response.data)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    setLoading(true)
    try {
      const commentData = {
        attachmentId: attachment.id,
        commentedById: currentUser.id,
        commentText: newComment.trim(),
        commentType: 'COMMENT'
      }
      
      await api.post('/attachment-comments', commentData)
      setNewComment('')
      fetchComments()
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Error adding comment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    setStatusAction(newStatus)
    setStatusComment('')
    setShowStatusDialog(true)
  }

  const handleRevertStatus = async () => {
    setStatusAction('REVERT')
    setStatusComment('')
    setShowStatusDialog(true)
  }

  const confirmStatusChange = async () => {
    if (!statusComment.trim()) {
      alert('Please add a comment explaining the status change.')
      return
    }

    setLoading(true)
    try {
      let endpoint = `/task-attachments/${attachment.id}/review`
      let requestData = {
        reviewedById: currentUser.id,
        reviewComment: statusComment.trim()
      }

      if (statusAction === 'REVERT') {
        endpoint = `/task-attachments/${attachment.id}/revert`
        requestData.revertComment = statusComment.trim()
      } else {
        requestData.approvalStatus = statusAction
      }

      await api.put(endpoint, requestData)
      
      // Add a status change comment
      const commentData = {
        attachmentId: attachment.id,
        commentedById: currentUser.id,
        commentText: `Status changed to ${statusAction === 'REVERT' ? 'PENDING' : statusAction}: ${statusComment.trim()}`,
        commentType: 'STATUS_CHANGE'
      }
      
      await api.post('/attachment-comments', commentData)
      
      setShowStatusDialog(false)
      setStatusComment('')
      fetchComments()
      onAttachmentUpdate()
      
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning'
      case 'APPROVED': return 'success'
      case 'REJECTED': return 'error'
      default: return 'default'
    }
  }

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString()
  }

  const canChangeStatus = () => {
    return isAdmin && currentUser.role === 'ADMIN'
  }

  const canRevert = () => {
    return isAdmin && attachment.approvalStatus !== 'PENDING'
  }

  return (
    <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
      <CardContent>
        {/* Attachment Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {attachment.type === 'LINK' ? <LinkIcon /> : <ImageIcon />}
              <Typography variant="h6" component="div">
                {attachment.fileName}
              </Typography>
              <Chip 
                label={attachment.approvalStatus} 
                color={getApprovalStatusColor(attachment.approvalStatus)}
                size="small"
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Uploaded by: {attachment.uploadedBy?.fullName} • {formatDateTime(attachment.createdAt)}
            </Typography>
            
            {attachment.description && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {attachment.description}
              </Typography>
            )}
            
            {attachment.reviewComment && (
              <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                <Typography variant="body2">
                  <strong>Review:</strong> {attachment.reviewComment}
                </Typography>
                {attachment.reviewedBy && (
                  <Typography variant="caption" display="block">
                    By {attachment.reviewedBy.fullName} • {formatDateTime(attachment.reviewedAt)}
                  </Typography>
                )}
              </Alert>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
            {attachment.type === 'LINK' ? (
              <Button
                size="small"
                startIcon={<LinkIcon />}
                onClick={() => window.open(attachment.fileUrl, '_blank')}
                variant="outlined"
              >
                Open Link
              </Button>
            ) : (
              <Button
                size="small"
                startIcon={<Visibility />}
                onClick={() => window.open(attachment.fileUrl, '_blank')}
                variant="outlined"
              >
                View Image
              </Button>
            )}
          </Box>
        </Box>

        {/* Admin Actions */}
        {canChangeStatus() && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {attachment.approvalStatus === 'PENDING' && (
              <>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => handleStatusChange('APPROVED')}
                  disabled={loading}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => handleStatusChange('REJECTED')}
                  disabled={loading}
                >
                  Reject
                </Button>
              </>
            )}
            
            {canRevert() && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Undo />}
                onClick={handleRevertStatus}
                disabled={loading}
              >
                Revert to Pending
              </Button>
            )}
          </Box>
        )}

        {/* Comments Section */}
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={showComments ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setShowComments(!showComments)}
            size="small"
          >
            Comments ({comments.length})
          </Button>
        </Box>

        <Collapse in={showComments}>
          <Box sx={{ mt: 2 }}>
            {/* Add Comment */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddComment()
                  }
                }}
                multiline
                maxRows={3}
              />
              <Button
                variant="contained"
                size="small"
                startIcon={<Send />}
                onClick={handleAddComment}
                disabled={loading || !newComment.trim()}
                sx={{ minWidth: 'auto' }}
              >
                Send
              </Button>
            </Box>

            {/* Comments List */}
            <List dense>
              {comments.map((comment) => (
                <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '14px' }}>
                      {comment.commentedBy?.fullName?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {comment.commentedBy?.fullName}
                        </Typography>
                        {comment.commentType === 'STATUS_CHANGE' && (
                          <Chip label="Status Change" size="small" color="info" />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(comment.createdAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {comment.commentText}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
              
              {comments.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No comments yet. Be the first to comment!
                </Typography>
              )}
            </List>
          </Box>
        </Collapse>
      </CardContent>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onClose={() => setShowStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {statusAction === 'REVERT' ? 'Revert Status' : `${statusAction} Attachment`}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {statusAction === 'REVERT' 
              ? 'Please explain why you are reverting this attachment to pending status:'
              : `Please add a comment explaining why you are ${statusAction.toLowerCase()}ing this attachment:`
            }
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Enter your comment..."
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmStatusChange}
            variant="contained"
            disabled={loading || !statusComment.trim()}
            color={statusAction === 'REJECTED' ? 'error' : 'primary'}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default AttachmentWithComments