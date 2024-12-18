import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
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
  Container,
} from 'reactstrap';
import { Dataset } from '../../types/dataset';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDateTime } from '../../utils/dateUtils';

const DatasetsPage: NextPage = () => {
  const router = useRouter();

  const { data: datasets, isLoading } = useQuery<Dataset[]>({
    queryKey: ['datasets'],
    queryFn: async () => {
      const { data } = await axios.get('/api/dataset');
      return data;
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="py-4">
      <PageHeader
        title="Datasets"
        action={
          <Button
            color="primary"
            onClick={() => router.push('/datasets/new')}
          >
            Create Dataset
          </Button>
        }
      />

      <Card>
        <CardBody>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Template</th>
                <th>Fields</th>
                <th>Version</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {datasets?.map((dataset) => (
                <tr key={dataset.id}>
                  <td>{dataset.name || 'Unnamed Dataset'}</td>
                  <td>{dataset.templateId}</td>
                  <td>
                    <Badge color="info">
                      {Object.keys(dataset.data).length} fields
                    </Badge>
                  </td>
                  <td>v{dataset.version}</td>
                  <td>{formatDateTime(dataset.updatedAt)}</td>
                  <td>
                    <UncontrolledDropdown>
                      <DropdownToggle caret color="light" size="sm">
                        Actions
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem
                          onClick={() => 
                            router.push(`/datasets/edit/${dataset.id}`)
                          }
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => 
                            router.push(`/batch/new?datasetId=${dataset.id}`)
                          }
                        >
                          Create Batch
                        </DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem
                          className="text-danger"
                          onClick={() => {
                            // TODO: Implement delete confirmation
                          }}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </td>
                </tr>
              ))}
              {(!datasets || datasets.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No datasets found. Create your first dataset to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </Container>
  );
};

export default DatasetsPage;