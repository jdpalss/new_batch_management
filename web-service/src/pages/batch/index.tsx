import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Button,
  Card,
  CardBody,
  Table,
  Badge,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { BatchConfig, BatchStatus } from '../../types/batch';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDateTime } from '../../utils/dateUtils';
import { useToasts } from '../../hooks/useToasts';

export default function BatchListPage() {
  const router = useRouter();
  const { addToast } = useToasts();
  const queryClient = useQueryClient();

  const { data: batches, isLoading } = useQuery<BatchConfig[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await axios.get('/api/batch');
      return response.data;
    }
  });

  const toggleBatch = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await axios.put(`/api/batch/${id}`, { isActive });
      return response.data;
    },
    onSuccess: (_, variables) => {
      addToast({
        type: 'success',
        message: `Batch ${variables.isActive ? 'activated' : 'deactivated'} successfully`
      });
      queryClient.invalidateQueries({ 
        queryKey: ['batches']
      });
      queryClient.invalidateQueries({ 
        queryKey: ['batch', variables.id]
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to toggle batch status'
      });
    }
  });

  const executeBatch = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`/api/batch/${id}/execute`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      addToast({
        type: 'success',
        message: 'Batch execution started'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['batches'],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['batch', variables]
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to execute batch'
      });
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Batch Management"
        action={
          <Button
            color="primary"
            onClick={() => router.push('/batch/new')}
          >
            Create Batch
          </Button>
        }
      />

      <Card>
        <CardBody>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Schedule</th>
                <th>Last Run</th>
                <th>Next Run</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches?.map((batch) => (
                <tr key={batch.id}>
                  <td>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/batch/${batch.id}`);
                      }}
                    >
                      {batch.title}
                    </a>
                  </td>
                  <td>
                    <Badge color={batch.isActive ? 'success' : 'secondary'}>
                      {batch.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    {batch.schedule.type === 'periodic'
                      ? batch.schedule.cronExpression
                      : 'Specific dates'}
                  </td>
                  <td>
                    {batch.lastRun ? formatDateTime(batch.lastRun) : 'Never'}
                  </td>
                  <td>
                    {batch.nextRun ? formatDateTime(batch.nextRun) : 'Not scheduled'}
                  </td>
                  <td>
                    <UncontrolledDropdown>
                      <DropdownToggle caret color="light" size="sm">
                        Actions
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem
                          onClick={() => router.push(`/batch/${batch.id}`)}
                        >
                          View Details
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => router.push(`/batch/edit/${batch.id}`)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => executeBatch.mutate(batch.id)}
                          disabled={!batch.isActive}
                        >
                          Run Now
                        </DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem
                          onClick={() =>
                            toggleBatch.mutate({
                              id: batch.id,
                              isActive: !batch.isActive
                            })
                          }
                        >
                          {batch.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </td>
                </tr>
              ))}
              {!batches?.length && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No batches found. Create your first batch to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}