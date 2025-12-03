from django.conf import settings
from elasticsearch import Elasticsearch
from apps.catalog.models import Product


class ElasticsearchService:
    def __init__(self):
        self.client = Elasticsearch([settings.ELASTICSEARCH_HOST])
        self.index_name = settings.ELASTICSEARCH_INDEX_NAME

    def create_index(self):
        """Создание индекса для продуктов"""
        if not self.client.indices.exists(index=self.index_name):
            self.client.indices.create(
                index=self.index_name,
                body={
                    'mappings': {
                        'properties': {
                            'id': {'type': 'integer'},
                            'name': {'type': 'text', 'analyzer': 'russian'},
                            'article': {'type': 'keyword'},
                            'final_price': {'type': 'float'},
                            'unit': {'type': 'keyword'},
                            'category': {'type': 'keyword'},
                        }
                    }
                }
            )

    def index_product(self, product):
        """Индексация одного продукта"""
        self.client.index(
            index=self.index_name,
            id=product.id,
            body={
                'id': product.id,
                'name': product.name,
                'article': product.article,
                'final_price': float(product.final_price),
                'unit': product.unit,
                'category': product.category.name if product.category else None,
            }
        )

    def search_products(self, query, limit=10):
        """Поиск продуктов"""
        response = self.client.search(
            index=self.index_name,
            body={
                'query': {
                    'multi_match': {
                        'query': query,
                        'fields': ['name^3', 'article^2'],
                        'fuzziness': 'AUTO'
                    }
                },
                'size': limit
            }
        )
        
        product_ids = [hit['_source']['id'] for hit in response['hits']['hits']]
        return Product.objects.filter(id__in=product_ids)

    def reindex_all(self):
        """Переиндексация всех продуктов"""
        products = Product.objects.filter(is_active=True)
        for product in products:
            self.index_product(product)



