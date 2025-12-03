from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Supplier, PriceList
from .serializers import SupplierSerializer, PriceListSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAdminUser]


class PriceListUploadView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        file = request.FILES.get('file')
        supplier_id = request.data.get('supplier_id')
        
        if not file or not supplier_id:
            return Response({'error': 'Файл и supplier_id обязательны'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            supplier = Supplier.objects.get(pk=supplier_id)
            price_list = PriceList.objects.create(supplier=supplier, file=file)
            return Response(PriceListSerializer(price_list).data, status=status.HTTP_201_CREATED)
        except Supplier.DoesNotExist:
            return Response({'error': 'Поставщик не найден'}, status=status.HTTP_404_NOT_FOUND)


class PriceListProcessView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            price_list = PriceList.objects.get(pk=pk)
            # TODO: Реализовать парсинг Excel файла
            price_list.status = 'PROCESSED'
            price_list.save()
            return Response(PriceListSerializer(price_list).data)
        except PriceList.DoesNotExist:
            return Response({'error': 'Прайс-лист не найден'}, status=status.HTTP_404_NOT_FOUND)



